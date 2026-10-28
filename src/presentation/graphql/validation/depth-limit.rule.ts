import {
  Kind,
  type ASTVisitor,
  type FragmentDefinitionNode,
  type SelectionSetNode,
  type ValidationContext,
} from 'graphql';
import { GraphQLError } from 'graphql';

const INTROSPECTION_FIELDS = new Set(['__schema', '__type']);

export function createDepthLimitRule(maxDepth: number): (context: ValidationContext) => ASTVisitor {
  return (context) => ({
    OperationDefinition(node) {
      const fragments = new Map<string, FragmentDefinitionNode>();
      for (const definition of context.getDocument().definitions) {
        if (definition.kind === Kind.FRAGMENT_DEFINITION) {
          fragments.set(definition.name.value, definition);
        }
      }

      const depth = measureDepth(node.selectionSet, fragments, new Set());
      if (depth > maxDepth) {
        context.reportError(
          new GraphQLError(`Глубина запроса ${depth} превышает лимит ${maxDepth}`, {
            nodes: [node],
          }),
        );
      }
    },
  });
}

function measureDepth(
  selectionSet: SelectionSetNode | undefined,
  fragments: ReadonlyMap<string, FragmentDefinitionNode>,
  stack: Set<string>,
): number {
  if (!selectionSet) {
    return 0;
  }

  let maxDepth = 0;
  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      if (INTROSPECTION_FIELDS.has(selection.name.value)) {
        continue;
      }
      maxDepth = Math.max(maxDepth, 1 + measureDepth(selection.selectionSet, fragments, stack));
      continue;
    }

    if (selection.kind === Kind.INLINE_FRAGMENT) {
      maxDepth = Math.max(maxDepth, measureDepth(selection.selectionSet, fragments, stack));
      continue;
    }

    if (stack.has(selection.name.value)) {
      continue;
    }

    const fragment = fragments.get(selection.name.value);
    if (!fragment) {
      continue;
    }

    stack.add(selection.name.value);
    maxDepth = Math.max(maxDepth, measureDepth(fragment.selectionSet, fragments, stack));
    stack.delete(selection.name.value);
  }

  return maxDepth;
}

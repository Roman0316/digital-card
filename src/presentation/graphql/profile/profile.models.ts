import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

import { DateOnlyGraphql } from '../scalars/date.scalar';

export enum LinkKindModel {
  GITHUB = 'GITHUB',
  LINKEDIN = 'LINKEDIN',
  TELEGRAM = 'TELEGRAM',
  WEBSITE = 'WEBSITE',
  OTHER = 'OTHER',
}

export enum SkillCategoryModel {
  LANGUAGE = 'LANGUAGE',
  FRAMEWORK = 'FRAMEWORK',
  DATABASE = 'DATABASE',
  PLATFORM = 'PLATFORM',
  PRACTICE = 'PRACTICE',
}

registerEnumType(LinkKindModel, {
  name: 'LinkKind',
  description: 'Тип профессиональной ссылки',
});

registerEnumType(SkillCategoryModel, {
  name: 'SkillCategory',
  description: 'Группа навыка',
});

@ObjectType('ProfileLink')
export class ProfileLinkModel {
  @Field(() => LinkKindModel, { description: 'Куда ведёт ссылка' })
  kind!: LinkKindModel;

  @Field({ description: 'Подпись ссылки' })
  label!: string;

  @Field({ description: 'Адрес ресурса' })
  url!: string;
}

@ObjectType('Skill')
export class SkillModel {
  @Field(() => ID)
  id!: string;

  @Field({ description: 'Название навыка' })
  name!: string;

  @Field(() => SkillCategoryModel)
  category!: SkillCategoryModel;
}

@ObjectType('Experience')
export class ExperienceModel {
  @Field(() => ID)
  id!: string;

  @Field({ description: 'Компания' })
  company!: string;

  @Field({ description: 'Должность' })
  position!: string;

  @Field(() => DateOnlyGraphql, { description: 'Дата начала' })
  startDate!: string;

  @Field(() => DateOnlyGraphql, {
    nullable: true,
    description: 'Дата окончания. Пусто, если роль текущая',
  })
  endDate!: string | null;

  @Field({ description: 'Роль не закрыта датой окончания' })
  isCurrent!: boolean;
}

@ObjectType('Project')
export class ProjectModel {
  @Field(() => ID)
  id!: string;

  @Field({ description: 'Название проекта' })
  name!: string;

  @Field({ description: 'Ссылка на проект или репозиторий' })
  url!: string;

  @Field(() => String, { nullable: true, description: 'Коротко, что это за проект' })
  summary!: string | null;
}

@ObjectType('Profile')
export class ProfileModel {
  @Field(() => ID)
  id!: string;

  @Field({ description: 'Имя' })
  name!: string;

  @Field({ description: 'Краткое описание' })
  description!: string;
}

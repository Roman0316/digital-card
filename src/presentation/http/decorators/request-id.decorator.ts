import { createParamDecorator } from '@nestjs/common';
import { ClsServiceManager } from 'nestjs-cls';

export const RequestId = createParamDecorator((): string =>
  ClsServiceManager.getClsService().getId(),
);

import { IsString, MinLength } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { AppValidationPipe } from '../../../src/presentation/http/pipes/app-validation.pipe';

class SampleDto {
  @IsString()
  @MinLength(2)
  name!: string;
}

describe('AppValidationPipe', () => {
  const pipe = new AppValidationPipe();

  it('пропускает корректный объект', async () => {
    await expect(
      pipe.transform({ name: 'Роман' }, { type: 'body', metatype: SampleDto, data: '' }),
    ).resolves.toEqual({
      name: 'Роман',
    });
  });

  it('отклоняет пустое имя с кодом проверки', async () => {
    await expect(
      pipe.transform({ name: '' }, { type: 'body', metatype: SampleDto, data: '' }),
    ).rejects.toMatchObject({
      response: { code: 'VALIDATION_ERROR' },
    });
  });
});

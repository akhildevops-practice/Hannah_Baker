import { Test, TestingModule } from '@nestjs/testing';
import { AspectImpactController } from './aspect-impact.controller';

describe('AspectImpactController', () => {
  let controller: AspectImpactController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AspectImpactController],
    }).compile();

    controller = module.get<AspectImpactController>(AspectImpactController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

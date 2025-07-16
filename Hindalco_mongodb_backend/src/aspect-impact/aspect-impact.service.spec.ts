import { Test, TestingModule } from '@nestjs/testing';
import { AspectImpactService } from './aspect-impact.service';

describe('AspectImpactService', () => {
  let service: AspectImpactService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AspectImpactService],
    }).compile();

    service = module.get<AspectImpactService>(AspectImpactService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

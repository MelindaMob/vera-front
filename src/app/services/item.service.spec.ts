import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { ItemService } from './item.service'; 

describe('ItemService', () => {
  let service: ItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        ItemService
      ]
    });
    
    service = TestBed.inject(ItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
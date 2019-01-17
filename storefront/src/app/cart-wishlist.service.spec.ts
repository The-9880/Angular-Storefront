import { TestBed } from '@angular/core/testing';

import { CartWishlistService } from './cart-wishlist.service';

describe('CartWishlistService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CartWishlistService = TestBed.get(CartWishlistService);
    expect(service).toBeTruthy();
  });
});

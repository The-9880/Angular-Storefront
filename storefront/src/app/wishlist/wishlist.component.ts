import { Component, OnInit } from '@angular/core';

import { WishlistItem } from '../WishlistItem';

import { CartWishlistService } from '../cart-wishlist.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {

  private wishlist: WishlistItem[] = [];

  constructor(private wishlistService: CartWishlistService) { }

  ngOnInit() {
    // Get the user's wishlist
    // store it in a local array.
    this.wishlistService.getWishList().subscribe((data) => {
      this.wishlist = data['wishlist'];
    });
  }

}

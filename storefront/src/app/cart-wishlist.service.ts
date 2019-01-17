import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs';

import {Item} from './Item';
import {WishlistItem} from './WishlistItem';

@Injectable({
  providedIn: 'root'
})
export class CartWishlistService {

  constructor(private http: HttpClient) { }

  getCart() : Observable<WishlistItem[]>
  {
    // Request the cart, attach JWT to the authorization header.
    var httpOptions = this.getHttpOptions();

    return this.http.get<WishlistItem[]>('/api/cart', httpOptions);
  }

  updateCart(cart: WishlistItem[])
  {
    console.log('Updating cart.');
    console.log(cart);
    // PUT request here, cart passed to the body.
    // Use the JWT as well.
    var httpOptions = this.getHttpOptions();

    this.http.put('/api/cart', {cart}, httpOptions).subscribe((data)=>{
      console.log(data);
    }); // we'll send the cart as it currently is in a PUT request
  }

  getMenuItems() : Observable<Item[]>
  {
    return this.http.get<Item[]>('/api/catalog');
  }

  getWishList() : Observable<[WishlistItem]>
  {
    var httpOptions = this.getHttpOptions();

    return this.http.get<[WishlistItem]>('/api/wishlist', httpOptions);
  }

  // Will update the stock of the item, and the amountSold of the item.
  // TOCHECK
  buyItem(item : WishlistItem)
  {
    console.log('Buying item.');

    this.http.get<Item>(`/api/catalog/${item.name}`).subscribe((data) => {
      // The object should be emitted as an Item.
      var dbItem = data['item'];
      console.log(dbItem);
      dbItem.stock -= item.quantity.valueOf(); // update the stock of the item.
      dbItem.amountSold += item.quantity.valueOf(); // update the amount of the item sold.
      console.log(dbItem);

      // Now send it back to the server to update the collection.
      console.log('Sending put request...');
      this.http.put(`/api/catalog/${item.name}`, {catalogItem: dbItem}).subscribe((data)=>{
        console.log(data);
      });
    });
  }

  // add an item to a cart, with a given quantity
  addItem(name: String, amount: Number)
  {
    var cart;
    this.getCart().subscribe((data) => {
      cart = data['cart'];
      
      for(var obj of cart)
      {
        if(obj.name == name)
        {
          // object already exists in cart - just increase the amount
          obj.quantity += amount;

          this.updateCart(cart);
          return;
        }
      }
      // Object isn't already in cart - add it, then.
      var newItem = new WishlistItem;
      newItem.name=name;
      newItem.quantity = amount;

      cart.push(newItem);
      this.updateCart(cart);
    });
  }

  // function to add a review
  addReview(arg: Item, comment: String, rating: number)
  {
    var httpOptions = this.getHttpOptions();

    this.http.post('/api/reviews', {item:arg, comment, rating}, httpOptions).subscribe();
  }

  // private function to attach the token to the authorization header
  private getHttpOptions()
  {
    var token = localStorage.getItem('fruitStoreToken');
      const httpOptions = {headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      };

    return httpOptions;
  }
}

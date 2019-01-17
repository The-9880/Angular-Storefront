import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {LoginSessionService} from '../login-session.service';
import {CartWishlistService} from '../cart-wishlist.service';

import {Item} from '../item';
import {Review} from '../Review';

@Component({
  selector: 'app-storefront',
  templateUrl: './storefront.component.html',
  styleUrls: ['./storefront.component.css']
})
export class StorefrontComponent implements OnInit {

  catalog: Item[] = [];
  chosenItem: Item;
  quantity: number;
  private currentReviews: Review[] = [];
  private currentRating : number;

  private comment: String = '';
  private rating: number;

  constructor(private session: LoginSessionService, private items: CartWishlistService, private http: HttpClient) { }

  ngOnInit() {
    this.items.getMenuItems().subscribe((data) => {
      console.log(data['items']);
      // this should emit the array of Item objects
      this.catalog = data['items'];
      // reorder them according to purchase counts.
      this.catalog.sort((a,b) => b.amountSold - a.amountSold);
    });
  }

  // function to load reviews for items
  getReviewsFor(arg: String)
  {
    console.log('Getting reviews!');
    this.http.get<Review[]>(`/api/reviews/${arg}`).subscribe((data) => {
      this.currentReviews = data['docs'];
      console.log(this.currentReviews);
    });
  }

  // Function to get the average rating for an item
  getAvgRating(arg: String)
  {
    console.log('Getting the rating.');
    this.http.get(`/api/rating/${arg}`).subscribe((data) => {
      this.currentRating = data['average'];
    });
  }


  // Function to open the modal when an item is selected
  selected(arg: Item)
  {
    this.chosenItem = arg;
    this.getReviewsFor(this.chosenItem.name);
    this.getAvgRating(this.chosenItem.name);
    // make the modal visible.
    document.querySelector(".modal").style.display = "block";
    document.querySelector(".commentBox").style.display = "block";

    
  }

  // Function to return the stock of any item, cross-referenced against our list of all items in the catalog
  getStock(item: Item)
  {
    for(var o of this.catalog)
    {
      if(o.name == item.name)
      {
        return o.stock;
      }
    }

    return 0;
  }

  // Function responsible for closing the modal view
  closeModal()
  {
    document.querySelector(".modal").style.display = "none";
    document.querySelector(".commentBox").style.display = "none";
  }

  // Function to add items to cart via service
  addToCart(name: String, amount: Number)
  {
    if(amount > this.chosenItem.stock || amount <= 0)
    {
      alert('Please add between 1 and however many items are available inclusive.');
      return;
    }

    alert("You've added " + amount + " to your cart.");
    this.items.addItem(name, amount);
  }

  addReview()
  {

    if(!this.comment && !this.rating)
    {
      alert('Comment will not be saved.');
      return;
    }

    //quickly validate fields first
    if(this.comment == '')
    {
      alert('You need to enter a comment to leave a review.');
      return;
    }
    if(this.rating < 0 || this.rating > 5)
    {
      alert('Please enter a rating between 1 and 5 inclusive.');
      return;
    }
    if(!Number.isInteger(this.rating))
    {
      alert('Please enter an integer value.');
      return;
    }

    if(confirm('Are you sure you want to leave this review? It will overwrite a previous one, if it exists.'))
    {
      this.items.addReview(this.chosenItem, this.comment, this.rating);
    }

  }

}

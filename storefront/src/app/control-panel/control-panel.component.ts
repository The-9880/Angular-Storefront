import { Component, OnInit } from '@angular/core';

import {User} from '../User';
import {Item} from '../Item';
import {Review} from '../Review';

import {ControlPanelService} from '../control-panel.service';
import {CartWishlistService} from '../cart-wishlist.service';

@Component({
  selector: 'app-control-panel',
  templateUrl: './control-panel.component.html',
  styleUrls: ['./control-panel.component.css']
})
export class ControlPanelComponent implements OnInit {

  private users: User[] = [];
  private items: Item[] = [];
  private reviews: Review[] = [];

  private newName: String = '';
  private newStock: number = 30;
  private newDescription: String = '';
  private amountSold: number = 0;
  private newPrice: number = 5;
  private newImageUrl: String = '';

  constructor(private control: ControlPanelService, private itemService: CartWishlistService) { }

  ngOnInit() {
    this.control.getUsers().subscribe((data) => {
      this.users = data['users']; // accessed and stored locally.
    });

    this.populateItems(); // fetch the latest items info from the backend and cache it here

    this.populateReviews(); // fetch the latest comments from the backend and cache them here
  }

  // Function to populate items array with the latest ones
  populateItems()
  {
    // Get the items so that we can manage them as well.
    this.itemService.getMenuItems().subscribe((data) => {
      this.items = data['items'];
      console.log(this.items);
    });
  }

  // Function to populate reviews array with latest reviews
  populateReviews()
  {
    // Store all the reviews locally.
    this.control.getReviews().subscribe((data) => {
      this.reviews = data['docs'];
    });
  }

  // function to hide a review
  hideComment(arg: Review)
  {
    arg.hidden = true;
    this.control.updateReview(arg);
  }
  // function to unhide a review
  unhideComment(arg: Review)
  {
    arg.hidden = false;
    this.control.updateReview(arg);
  }

  // funtion to add an item
  addItem()
  {
    if(this.newName == '')
    {
      alert("The new item must have a name.");
      return;
    }
    if(this.newDescription == '')
    {
      alert('Enter a description for the new item.');
      return;
    }
    if(this.newPrice <= 0)
    {
      alert('Enter a reasonable price for the new item, please.');
      return;
    }
    if(this.newImageUrl == '')
    {
      alert('Please enter a URL for the new item\'s image please.');
      return;
    }
    if(this.newStock < 0)
    {
      alert('Give the new item a possible amount of stock, please.');
      return;
    }

    var newItem = new Item;
    newItem.name = this.newName;
    newItem.amountSold = this.amountSold;
    newItem.imageUrl = this.newImageUrl;
    newItem.price = this.newPrice;
    newItem.stock = this.newStock;
    newItem.description = this.newDescription;

    this.control.addItem(newItem);


    this.populateItems();
  }

  // function to promote user to store manager
  makeSM(arg: User)
  {
    arg.authLevel = 2;
    this.control.updateUsers(this.users);
  }
  
  // Function to re-active users, or demote store managers.
  activate(arg: User)
  {
    arg.authLevel = 1;
    this.control.updateUsers(this.users);
  }

  // function to deactive user's account
  deactivate(arg: User)
  {
    arg.authLevel = 0;
    this.control.updateUsers(this.users);
  }

  // function to delete an item
  deleteItem(arg: Item)
  {
    this.control.deleteItem(arg.name);

    this.populateItems(); // update the items list
  }

  // function to save the changes to the catalog items
  saveCatalog()
  {
    this.control.updateCatalog(this.items);

    this.populateItems(); // update the items list.
  }

}

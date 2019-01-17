import { Component, OnInit } from '@angular/core';

import {CartWishlistService} from '../cart-wishlist.service';

import { Item } from '../Item';
import { WishlistItem } from '../WishlistItem';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  private cart: WishlistItem[] = [];
  private currentStock: Item[] = [];
  private total: number = 0;

  private receipt: WishlistItem[];
  private receiptTotal: number;

  constructor(private cartService: CartWishlistService) { }

  ngOnInit() {
    this.cartService.getCart().subscribe((data) => {
      this.cart = data['cart'];
      console.log(this.cart);
      this.receipt = this.cart;
    });

    this.cartService.getMenuItems().subscribe((data) => {
      this.currentStock = data['items'];
    });
  }

  // Method to keep the total up-to-date
  calculateTotal()
  {
      var runningTotal = 0;
    
      for(var x of this.cart)
      {
        for(var y of this.currentStock)
        {
          if(y.name == x.name)
          {
            runningTotal += x.quantity * y.price;
            break;
          }
        }
      }

      this.total = runningTotal;
  }

  getPrice(arg: WishlistItem)
  {
    this.calculateTotal();
    var thisCost = 0;
    for(var x of this.currentStock)
    {
      if(x.name == arg.name)
      {
        thisCost = arg.quantity * x.price;
        break;
      }
    }
    return thisCost;
  }


  compareVals(a, thisItem)
  {
    if(a.value > this.getStock(thisItem))
    {
      alert('You cannot order more than is available.');
      a.value = thisItem.quantity;
    } else {
      thisItem.quantity = a.value;
    }
  }

  // Function to enact the purchasing of cart items
  purchase()
  {
    if(!confirm('Are you sure you are ready to purchase these items? You can cancel and review the total cost first.'))
    {
      return;
    }
    this.receiptTotal = this.total;

    // First, let's pull the latest stock information from the db
    this.cartService.getMenuItems().subscribe((data) => {
      this.currentStock = data['items'];
    

    // Begin with a check that all quantities are serviceable -- if they aren't, then stop and give an error message.
    for(var item of this.cart)
    {
      for(var dbItem of this.currentStock)
      {
        // Found the item to compare stock with
        if(dbItem.name == item.name)
        {
          if(dbItem.stock < item.quantity)
          {
            // we're ordering more than is available, throw an alert to the user.
            alert('Please check your quantities - you cannot order more than are in stock.');
            return;
          }
        }
      }
    }
  

    // If quantitites are available, then past the cart to the cartService so that it can update the database accordingly
    for(var item of this.cart)
    {
      this.cartService.buyItem(item);
    }

    // via the backend API
    this.clear(); // clear the cart at the end.

    document.querySelector(".modal").style.display = "block";
    this.total = 0;
  });
  }

  // function to close modal
  closeModal()
  {
    document.querySelector(".modal").style.display="none";
  }

  // Function to totally empty the cart
  clear()
  {
    // empty the cart, update the user's cart through the backend
    this.cart = [];
    this.cartService.updateCart(this.cart);
    this.total = 0;
  }
  promptClear()
  {
    if(confirm('Are you sure you wish to clear the cart?'))
    {
      this.cart = [];
      this.cartService.updateCart(this.cart);
      this.total = 0;
    }
  }

  // used in the template to get the image url of a wishlist item for display
  private getItemImage(item: WishlistItem)
  {
    for(var o of this.currentStock)
    {
      if(o.name == item.name)
      {
        return o.imageUrl;
      }
    }
  }
  
  // used in the template to get the current stock of a wishlist item from the overall catalog.
  private getStock(item: WishlistItem)
  {
    for(var o of this.currentStock)
    {
      if(o.name == item.name)
      {
        return o.stock;
      }
    }
  }

  // TOCHECK
  remove(item: WishlistItem)
  {
    // go through the cart and find the item, remove it via splice.
    var index = this.cart.indexOf(item);
    
    this.cart.splice(index, 1); // remove one item starting from the supplied index.
    this.cartService.updateCart(this.cart); // now update the cart
    this.calculateTotal();
  }
}

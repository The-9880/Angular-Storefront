import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import {Observable} from 'rxjs';

import {User} from './User';
import {Item} from './Item';
import {Review} from './Review';

@Injectable({
  providedIn: 'root'
})
export class ControlPanelService {

  constructor(private http: HttpClient) { }

  // Function to retrieve all the users.
  getUsers() : Observable<User[]>
  {
    var httpOptions = this.getHttpOptions();

    return this.http.get<User[]>('/api/users', httpOptions);
  }

  // Function to save changes to users on the backend.
  // Takes an updated users array which it will send to the backend for processing.
  updateUsers(args: User[])
  {
    var httpOptions = this.getHttpOptions();

    console.log('Sending updated users to server.');
    for(var x of args)
    {
      this.http.put('/api/users', {updatedUser: x}, httpOptions).subscribe();
    }
  }
  
  // function to delete an item from the backend database
  deleteItem(itemName: String)
  {
    var httpOptions = this.getHttpOptions();

    this.http.delete(`/api/catalog/${itemName}`, httpOptions).subscribe();
  }

  // function to add a catalog item
  addItem(item : Item)
  {
    console.log(item);
    console.log('Adding item to catalog.');

    var httpOptions = this.getHttpOptions();

    this.http.post('/api/catalog', {item}, httpOptions).subscribe((data) => {
      console.log(data);
    });
  }

  // function to update the catalog
  updateCatalog(args: Item[])
  {
    console.log('Updating catalog!');
    var httpOptions = this.getHttpOptions();

    console.log(args);

    for(var x of args){
    this.http.put('/api/catalog', {updatedItem: x}, httpOptions).subscribe();
    }
  }

  // Function to get all reviews
  getReviews() : Observable<Review[]>
  {
    return this.http.get<Review[]>('/api/reviews');
  }

  // Function to update a review from the SM (hide and unhide)
  updateReview(arg: Review)
  {
    var httpOptions = this.getHttpOptions();

    this.http.put('/api/reviews', {review:arg}, httpOptions).subscribe();
  }

  // local helper function to embed the JWT into the headers.
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

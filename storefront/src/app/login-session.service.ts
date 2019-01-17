import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginSessionService {

  private loggedIn: boolean = false;
  private token: string;
  private authLevel: Number = 0;
  private email: string;

  constructor(private http: HttpClient, private router: Router) { }

  isLoggedIn() : boolean
  {
    // Change this - it'll first check if the loggedIn flag is set
    // if loggedIn is false, it'll check localStorage for a JWT
    // if no token, return false. Otherwise, verify the token with the backend and return
    // if the session is still active (in which case, set the flag to true) or else return false.

    if(!this.loggedIn)
    {
      if(!localStorage.getItem('fruitStoreToken'))
      {
        // The token does not exist in local storage - we're not signed in
        console.log('Not signed in.');
        return false;
      } else {
        // If the token does exist in local storage, we need to verify that it is still valid.
        // and if it isn't, we should also remove it from local storage.
        this.token = localStorage.getItem('fruitStoreToken');
        const httpOptions = {headers: new HttpHeaders({
            'Authorization': `Bearer ${this.token}`
          })
        };

        this.http.post('/api/verifytoken', {}, httpOptions).subscribe(data => {
          if(data['message'] == 'Success')
          {
            this.loggedIn = true;
            this.email = data['email'];
            this.authLevel = data['authLevel'];
            console.log('Resuming active session.');
            return true;
          } else {
            localStorage.removeItem('fruitStoreToken');
            console.log('Previous session has expired.');
            this.signout();
            return false;
          }
        });
      }
    }

    return this.loggedIn;
  }

  login(user: string, pw: string) {
    // send the username and password in the body of the POST request.

    this.http.post<JSON>('/api/login', {user, pw}).subscribe(data => {
      // the data returned should be a JWT -- JSON format.
      // this JWT will need to be included in the authorization header of all subsequent requests to the backend.
      if(data['message'] == 'No such user')
      {
        alert('Account does not exist.');
        return;
      }
      if(data['message'] == 'Deactivated')
      {
        alert('That account has been deactivated - please contact the store manager at storemanager@fruitnation.com');
        return;
      }
      if(data['message'] == 'Verify')
      {
        if(confirm('This account needs to be activated first - would you like us to resend the activation link via email?'))
        {
          console.log('Resending verification');
          // Pass the username to the re-send activation route.
          this.http.post('/api/login/resend-verification', {user}).subscribe();
        }
        return;
      }
      if(data['message'] == 'Invalid Email')
      {
        alert('Please use a correctly-formatted email for your login.');
        return;
      }

      if(data['message'] == 'Invalid')
      {
        alert("Login credentials invalid");
      } else {
        this.token = data['message']; // message will be the JWT.
        this.authLevel = data['auth'];
        this.email = data['email'];
        console.log(this.token + ' ' + this.authLevel + ' ' + this.email);
        // store in local storage
        localStorage.setItem('fruitStoreToken', this.token);
        alert('Login successful!');
      }
    });
  }

  getEmail()
  {
    return this.email;
  }

  getAuthLevel()
  {
    return this.authLevel;
  }

  signout()
  {
    // Will need to send a signal to the backend to blacklist the JWT
    // Will need to remove the JWT from localstorage
    // Then renavigate to the login page or the home page.

    // Client-side token removal.
    this.token = undefined;
    this.loggedIn = false;
    this.authLevel = 0;
    localStorage.removeItem('fruitStoreToken');

    this.router.navigateByUrl('/home');
    this.isLoggedIn();
  }

}

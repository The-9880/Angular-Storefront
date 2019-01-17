import { Component, OnInit } from '@angular/core';
import { LoginSessionService } from '../login-session.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private formMode: Boolean = true;

  username: string;
  password: string;

  constructor(private session: LoginSessionService, private http: HttpClient, private router: Router) { }

  ngOnInit() {

    if(this.session.isLoggedIn())
    {
      this.router.navigateByUrl('/catalog');
    }

  }

  loginClick()
  {
    var okay = true;

    if(!this.username)
    {
      alert('Please enter your email - field should not be blank.');
      okay = false;
    }
    if(!this.password)
    {
      alert('Please enter the password - this field should not be blank.');
      okay = false;
    }

    if(!okay) return;

    this.session.login(this.username, this.password);
  }

  signup()
  {
    var okay = true;

    if(!this.username)
    {
      alert('Please enter your email - field should not be blank.');
      okay = false;
    }
    if(!this.password)
    {
      alert('Please enter the password - this field should not be blank.');
      okay = false;
    }

    if(!okay) return;

    this.http.post<JSON>('/api/signup', { username:this.username, password:this.password }).subscribe((data) => {
      if(data['message'] == 'Invalid email')
      {
        alert('That is not a valid email.');
        return;
      }


      if(data['message'] == 'Invalid')
      {
        alert('An account already exists for that email.');
      } else {
        alert('Account created! Check your email for the activation link.');
      }
    });
  }

}

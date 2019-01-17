import { Component, OnInit } from '@angular/core';
import { LoginSessionService } from '../login-session.service';

import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private session: LoginSessionService, private router: Router) { }

  ngOnInit() {
  }

  logout()
  {
    console.log('Signing out.');
    this.session.signout();
  }

}

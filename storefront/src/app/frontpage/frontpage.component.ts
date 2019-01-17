import { Component, OnInit } from '@angular/core';

import {LoginSessionService} from '../login-session.service';

@Component({
  selector: 'app-frontpage',
  templateUrl: './frontpage.component.html',
  styleUrls: ['./frontpage.component.css']
})
export class FrontpageComponent implements OnInit {

  constructor(private session: LoginSessionService) { }

  ngOnInit() {
  }

}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from './login/login.component';
import { StorefrontComponent } from './storefront/storefront.component';
import { FrontpageComponent } from './frontpage/frontpage.component';
import {CartComponent} from './cart/cart.component';
import {WishlistComponent} from './wishlist/wishlist.component';
import {ControlPanelComponent} from './control-panel/control-panel.component';

const routes: Routes = [
  {path: '', redirectTo:'home', pathMatch:'full'},
  {path: 'home', component:FrontpageComponent},
  {path: 'catalog', component: StorefrontComponent},
  {path: 'wishlist', component: WishlistComponent},
  {path: 'cart', component: CartComponent},
  {path:'login', component: LoginComponent},
  {path: 'control-panel', component: ControlPanelComponent}
];  

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

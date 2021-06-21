import { Component } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'sensor-querier';

  cognitoUrl = ""

  token = "";

  showLogin = true;

  attemptLoginWithCognito(){

  }




}

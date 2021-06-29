import { Component, Input } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
// import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
// import { ErrorStateMatcher } from '@angular/material/core';
// import { MatFormField } from '@angular/material/form-field';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass'],
})
export class AppComponent {
  title: string = 'sensor-querier';

  cognitoUrl: string = '';

  apiGatewayUrl: string = 'https://8u4uehihzi.execute-api.eu-west-1.amazonaws.com/dev/query';
  cognitoLogin: string = "https://sensor-query-dev-cpp-query-domain.auth.eu-west-1.amazoncognito.com/login?client_id=389iopmttjv3s4h28rslmu6sfh&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://main.dwujzq2e6bkwk.amplifyapp.com/"

  accessToken: string = '';

  showLogin: boolean = true;

  @Input() username: string = '';
  @Input() password: string = '';

  @Input() customerId: string = '';
  @Input() deviceId: string = '';

  @Input() endDate: Date = new Date();
  @Input() startDate: Date = new Date();

  newDeviceId: string = '';
  deviceIds: string[] = [];

  credentialsDirty: boolean = false;

  dataRequestDirty: boolean = false;

  downloadLink: string = "";
  linkError: boolean = false;

  loading: boolean = false;

  constructor(private http: HttpClient) {
    let url = window.location.href;

    let splitUrl : string[] = url.split("access_token=");

    if(splitUrl.length > 1){
      let accessTokenSplit = splitUrl[1].split("&");
      this.accessToken = accessTokenSplit[0];
    }

    if(this.accessToken){
      this.showLogin = false;
    } else {
      window.location.href = this.cognitoLogin;
    }
  }

  onSubmitCredentials() {
    if (this.username != '' && this.password != '') {
      this.showLogin = false;
    } else {
      this.credentialsDirty = true;
    }
  }

  addDeviceId() {
    if (this.deviceId) {
      this.deviceIds.push(this.deviceId);
      this.deviceId = '';
    }
  }

  removeDeviceId(deviceId: string) {
    for (var i = 0; i < this.deviceIds.length; i++) {
      if (this.deviceIds[i] == deviceId) {
        this.deviceIds.splice(i, 1);
        break;
      }
    }
  }

  startDateIsBeforeEndDate() {
    return this.startDate < this.endDate;
  }

  onAnother(){
    this.downloadLink = "";
  }

  onSubmit() {
    this.linkError = false;
    this.dataRequestDirty = true;

    if (this.startDateIsBeforeEndDate() == false) {
      return;
    }

    if (this.deviceIds.length <= 0) {
      return;
    }

    if (this.customerId == '') {
      return;
    }

    this.loading = true;
    this.dataRequestDirty = false;

    this.getLink(this.startDate, this.endDate, this.customerId, this.deviceIds).subscribe((response: any) => {
      console.log(response);
      if(response['statusCode'] == 500){
        this.linkError = true;

      } else {

        this.downloadLink = response;
      }
      this.loading = false;
    }, (error) => {
      this.linkError = true;
      console.log(error);
      this.loading = false;
    });
  }

  getLink(
    start: Date,
    end: Date,
    customerId: string,
    deviceIds: string[]
  ) : Observable<string>  {
    //! Post request with token to API Gateway

    let startString : string = start.toString().replace('T', ' ') + ":00"
    let endString : string = end.toString().replace('T', ' ') + ":00"

    let queryObject = {
      "customerId": customerId,
      "deviceIds": deviceIds,
      "start": startString,
      "end": endString,
    }

    let queryString : string = JSON.stringify(queryObject)

    return this.http.post(
        this.apiGatewayUrl, queryString, {
      headers: {
        "Authorization": this.accessToken
      },
      responseType: 'text'
    })
  }
}

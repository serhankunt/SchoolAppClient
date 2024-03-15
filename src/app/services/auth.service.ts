import { Router } from "@angular/router";
import { TokenModel } from "../components/models/token.model";

import { JsonPipe } from "@angular/common";
import {jwtDecode } from "jwt-decode";
import { Injectable, inject } from "@angular/core";

@Injectable({
    providedIn:'root'
})

export class AuthService{

    token : string = "";
    
    //router = inject(Router);
    constructor(private router:Router)
    {}

    checkAuthentication(){

        const responseString = localStorage.getItem("response");
        if(responseString !=null){
            try {
                this.token = responseString;
                const decode = jwtDecode(responseString);

                const now:number = new Date().getTime()/1000;
                const exp: number |undefined = decode.exp;
               if(exp==undefined){
                this.router.navigateByUrl("/login");
                return false;
               }
               if(exp<now){
                this.router.navigateByUrl("/login");
                return false;
               }
                return true;
            } catch (error) {
                console.error(error);
                this.router.navigateByUrl("/login");
                return false;
            }
            
        }else{
            this.router.navigateByUrl("/login");
            return false;
        }

        // const responseString = localStorage.getItem("response");

        // if(!responseString){
        //     return this.redirectToLogin();
        // }
      
        // const responseJson = JSON.parse(responseString);
        // this.tokenString = responseJson.accessToken;

        // if(!this.tokenString){
        //     return this.redirectToLogin();
        // }
       
        // const decode : any = jwtDecode(this.tokenString);
        // this.token.email = decode?.email;
        // this.token.name = decode?.name;
        // this.token.userName = decode?.userName;
        // this.token.userId = decode?.userId;
        // this.token.roles = decode?.roles;
        // this.token.exp = decode?.exp;
        
        // const now = new Date().getTime()/1000;
        // if(this.token.exp<now){
        //     return this.redirectToLogin();
        // }
        // return true;
    }

    redirectToLogin(){
        this.router.navigateByUrl("/login");
        return false;
        }
}


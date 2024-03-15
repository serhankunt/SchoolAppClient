import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaginationRequestModel } from '../models/pagination.request.model';
import { HttpService } from '../../services/http.service';
import { PaginationResponseModel } from '../models/pagination.response.model';
import { StudentModel } from '../models/student.model';

@Component({
  selector: 'app-print',
  standalone: true,
  imports: [],
  templateUrl: './print.component.html',
  styleUrl: './print.component.css'
})
export class PrintComponent {
  request = new PaginationRequestModel();
  response : PaginationResponseModel<StudentModel[]> = new PaginationResponseModel<StudentModel[]>();
constructor(private activated:ActivatedRoute,
  private http:HttpService){
  this.activated.params.subscribe((res)=>{
    this.request.id = res["value"];

    this.getAllStudentByClassRoomId();
  });
}


getAllStudentByClassRoomId(){

  this.response.datas = [];
  
  this.http.post("Students/GetAllByClassRoomId",this.request, res=>{
    this.response = res;

    if(this.response.datas != null){
     

      this.response.datas = this.response.datas!.map((val:any,index:number)=>{
        const identityNumberPart1 = val.identityNumber.substring(0,2);
        const identityNumberPart2 = val.identityNumber.substring(val.identityNumber.length-3,11);
  
        const newHashedIdentityNumber = identityNumberPart1 +"******"+ identityNumberPart2;
  
        val.identityNumber = newHashedIdentityNumber;
  
        return val;
    });
  };

  window.print();

  });
}
}


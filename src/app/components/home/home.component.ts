import { AfterContentInit, Component, ElementRef, ViewChild } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { ClassRoomModel } from '../models/class-room.model';
import { StudentModel } from '../models/student.model';
import { HttpService } from '../../services/http.service';
import { FormsModule, NgForm } from '@angular/forms';
import { StudentPipe } from '../../pipes/student.pipe';
import { FormValidateDirective } from 'form-validate-angular';
import { SwalService } from '../../services/swal.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { PaginationRequestModel } from '../models/pagination.request.model';
import { PaginationResponseModel } from '../models/pagination.response.model';

declare const $ : any ;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterOutlet,CommonModule,FormsModule,StudentPipe,FormValidateDirective,NgxPaginationModule,RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterContentInit {

classRooms : ClassRoomModel[] = [];
//students: StudentModel[] = [];

response : PaginationResponseModel<StudentModel[]> = new PaginationResponseModel<StudentModel[]>();
request : PaginationRequestModel = new PaginationRequestModel();
p : number = 1; 
addClassRoomModel : ClassRoomModel = new ClassRoomModel();

pageNumbers :number[] = [1,2,3,4];

@ViewChild("studentAddModalCloseBtn") studentAddModalCloseBtn : ElementRef<HTMLButtonElement> | undefined;  
@ViewChild("addClassRoomModalCloseBtn") addClassRoomModalCloseBtn:ElementRef<HTMLButtonElement> | undefined;
// = new ElementRef<HTMLButtonElement>();

addStudentModel : StudentModel = new StudentModel();
updateStudentModel : StudentModel = new StudentModel();

loadingStartTime :number = 0;
viewRenderedTime :number = 0 ;
result : string = "";

search : string = "";
isLoading:boolean = false;

constructor(public http:HttpService,
  private swal : SwalService,
  private auth:AuthService){
  this.getAllClassRoom();
  
}
  ngAfterContentInit(): void {
   
  }

ngAfterChecked() {
  // this.viewRenderedTime = performance.now();
  // const loadingDuration = this.viewRenderedTime - this.loadingStartTime;
  // if (this.students.length > 0) {
  //   this.result = `Verilerin yüklenmesi ve görünüme yansıtılması ${{loadingDuration}} milisaniye sürdü`;
  // }
}

changePage(pageNumber:number){
  if(pageNumber <1){
    this.request.pageNumber = 1;
  }
  else{
  this.request.pageNumber = pageNumber;
  }

  this.getAllStudentByClassRoomId(this.request.id);
}


getAllClassRoom(){
  this.http.get("ClassRooms/GetAll",(res)=>{
    this.classRooms = res ;

      if(this.classRooms.length>0){
        this.getAllStudentByClassRoomId(this.classRooms[0].id);
      }
  })
}

getAllStudentByClassRoomId(roomId : string | null){
  this.request.id = roomId;

  this.response.datas = [];
  this.isLoading = true;
  
  this.http.post("Students/GetAllByClassRoomId",this.request, res=>{
    this.response = res;

    if(this.response.datas != null){
      this.calculatePageNumbers();

      this.response.datas = this.response.datas!.map((val,index)=>{
        const identityNumberPart1 = val.identityNumber.substring(0,2);
        const identityNumberPart2 = val.identityNumber.substring(val.identityNumber.length-3,11);
  
        const newHashedIdentityNumber = identityNumberPart1 +"******"+ identityNumberPart2;
  
        val.identityNumber = newHashedIdentityNumber;
  
        return val;
    })
  };

    this.isLoading = false;
  },()=>{
    this.isLoading = false;
  });
}

createStudent(form:NgForm){
  if(form.valid){
    if(this.addStudentModel.classRoomId ==="0"){
      alert("You have to choose a valid classroom");
      return;
    }

    this.http.post("Students/Create",this.addStudentModel,(res)=>{
      console.log(res);
    this.studentAddModalCloseBtn?.nativeElement.click();
    this.swal.callToast(res.message);
    this.getAllStudentByClassRoomId(this.addStudentModel.classRoomId);
    this.addStudentModel = new StudentModel();
    });
  }
  else{
    this.http.post("Student/Create",this.addStudentModel,(res)=>{
      this.swal.callToast(res.message,"error");
    })
  }
}
clearAddStudentModel(){
  this.addStudentModel = new StudentModel(); 
  this.clearInputInValidClass();
}

clearAddClassRoomModel(){
  this.addClassRoomModel = new ClassRoomModel();
  this.clearInputInValidClass();
}

clearInputInValidClass(){
  const inputs = document.querySelectorAll(".form-control.is-invalid");
  for(let i in inputs){
    const el = inputs[i];
    el.classList.remove("is-invalid");
  }
}

createClassRoom(form:NgForm){
  if(form.valid){
    this.http.post("ClassRooms/Create",this.addClassRoomModel,(res)=>{
      this.swal.callToast(res.message);
      this.addClassRoomModalCloseBtn?.nativeElement.click();
      this.getAllClassRoom();
    })
  }
}

calculatePageNumbers(){
  this.pageNumbers = [];
  const startNumber = this.response.pageNumber -2 < 1 ? 1 : this.response.pageNumber -2 ;
  const endNumber =  this.response.totalPages <= this.response.pageNumber+4 ? this.response.totalPages : this.response.pageNumber+4 ;
  for(let i = startNumber ; i <= endNumber; i++) {
    this.pageNumbers.push(i);
  }
}

}

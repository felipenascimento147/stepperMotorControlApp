import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '../services/alert.service';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;

  private motorStepForm: FormGroup;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private httpService: HttpService
  ) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    this.createForm();
  }

  createForm() {
    this.motorStepForm = this.formBuilder.group({
      stepMotorX: [0, Validators.required],
      speedMotorX: [0, Validators.required],
      stepMotorY: [0, Validators.required],
      speedMotorY: [0, Validators.required]
    });
  }

  clearInput(input) {
    this.motorStepForm.get(input).setValue(null);
  }

  async confirmMoviment() {
    if (this.motorStepForm.invalid) {
      return await this.alertService.okAlert("Erro", "Preencha todos os campos do formulário.");
    }
    console.log("confirm", this.motorStepForm.value);
    this.httpService.confirmMoviment().subscribe(response => {
      console.log("deu bom", response);
    }, error => {
      console.log(error);
    })
  }
}

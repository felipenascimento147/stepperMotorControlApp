import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '../services/alert.service';
import { HttpService } from '../services/http.service';
import { LoadingService } from '../services/loading.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { async } from '@angular/core/testing';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;

  private motorStepForm: FormGroup;
  formOk: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private bluetoothSerial: BluetoothSerial,
    private alertService: AlertService,
    private httpService: HttpService,
    private loadingService: LoadingService
  ) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    this.createForm();
  }

  createForm() {
    this.motorStepForm = this.formBuilder.group({
      stepMotorX: [null, Validators.required],
      speedMotorX: [null, Validators.required],
      stepMotorY: [null, Validators.required],
      speedMotorY: [null, Validators.required]
    });
    this.checkBluetoothEnabled();
  }

  checkBluetoothEnabled(){
    this.bluetoothSerial.isEnabled().then(reponse=>{
      this.listDevices();
    }, error =>{
      this.alertService.okAlert("Erro", "Verifique se o bluetooth está ligado.")
    })
  }

  listDevices(){
    this.bluetoothSerial.list().then(response =>{
      this.connectDevice("00:21:13:02:2E:B5");
    }, error => {
      this.alertService.okAlert("Erro", "Houve algum erro para carregar a lista de dispositivos bluetooth.");
    })
  }

  async connectDevice(address){
    await this.loadingService.presentLoading();
    this.bluetoothSerial.connect(address).subscribe(respose=>{
      this.loadingService.closeLoading();
      this.alertService.okAlert("Sucesso", "Dispositivo conectado com sucesso.");
    }, error=>{
      this.loadingService.closeLoading();
      this.alertService.okAlert("Erro", "Houve algum erro ao conectar com o dispositivo bluetooth.");
    })
  }

  clearInput(input) {
    this.motorStepForm.get(input).setValue(null);
  }

  async confirmMoviment() {
    await this.verifyInputs();

    if (this.formOk) {
      console.log("confirm", this.motorStepForm.value);

      await this.loadingService.presentLoading();

      this.httpService.confirmMoviment(this.motorStepForm.value).subscribe(response => {
        console.log(response);
        this.loadingService.closeLoading();
      }, error => {
        console.log(error);
        this.loadingService.closeLoading();
      })
    }
  }

  async verifyInputs() {
    this.formOk = false;

    if (this.motorStepForm.invalid) {
      return await this.alertService.okAlert("Erro", "Preencha todos os campos do formulário.");
    }
    this.motorStepForm.value.stepMotorX = Number(this.motorStepForm.value.stepMotorX);
    this.motorStepForm.value.stepMotorY = Number(this.motorStepForm.value.stepMotorY);

    if (this.motorStepForm.value.stepMotorX == 0 && this.motorStepForm.value.speedMotorX != 0) {
      return await this.alertService.okAlert("Erro", "A posição do motor X deve ser diferente de zero.");
    }

    if (this.motorStepForm.value.stepMotorX != 0 && this.motorStepForm.value.speedMotorX == 0) {
      return await this.alertService.okAlert("Erro", "A velocidade do motor X deve ser maior que zero.");
    }

    if (this.motorStepForm.value.stepMotorY == 0 && this.motorStepForm.value.speedMotorY != 0) {
      return await this.alertService.okAlert("Erro", "A posição do motor Y deve ser diferente de zero.");
    }

    if (this.motorStepForm.value.stepMotorY != 0 && this.motorStepForm.value.speedMotorY == 0) {
      return await this.alertService.okAlert("Erro", "A velocidade do motor Y deve ser maior que zero.");
    }
    this.formOk = true;
  }

  sendData(){
    this.bluetoothSerial.write('a').then(respose=>{
      this.alertService.okAlert("Certo", respose);
    },error=>{
      this.alertService.okAlert("Erro", "Houve algum erro ao enviar os dados para o Arduino.");
    })
  }

}

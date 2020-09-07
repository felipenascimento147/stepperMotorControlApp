import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AlertService } from '../services/alert.service';
import { LoadingService } from '../services/loading.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';

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

  async checkBluetoothEnabled() {
    await this.loadingService.presentLoading();
    this.bluetoothSerial.isEnabled().then(response => {
      this.loadingService.closeLoading();
    }, error => {
      this.loadingService.closeLoading();
      this.alertService.okAlert("Erro", "Verifique se o bluetooth está ligado.")
    })
  }

  clearInput(input) {
    this.motorStepForm.get(input).setValue(null);
  }

  async confirmMoviment() {
    await this.verifyInputs();

    if (this.formOk) {
      this.connectDevice("00:21:13:02:2E:B5");
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

  async connectDevice(address) {
    await this.loadingService.presentLoading();
    this.bluetoothSerial.connect(address).subscribe(respose => {
      this.sendData();
    }, error => {
      this.loadingService.closeLoading();
      this.alertService.okAlert("Erro", "Houve algum erro ao conectar com o dispositivo bluetooth.");
    })
  }

  sendData() {
    this.bluetoothSerial.write(`stepX=${this.motorStepForm.value.stepMotorX}&speedX=${this.motorStepForm.value.speedMotorX}&stepY=${this.motorStepForm.value.stepMotorY}&speedY=${this.motorStepForm.value.speedMotorY}/`).then(respose => {
      this.loadingService.closeLoading();
      this.bluetoothSerial.disconnect();
    }, error => {
      this.loadingService.closeLoading();
      this.bluetoothSerial.disconnect();
      this.alertService.okAlert("Erro", "Houve algum erro ao enviar os dados para o Arduino.");
    })
  }
}

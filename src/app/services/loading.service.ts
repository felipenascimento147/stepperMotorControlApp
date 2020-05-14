import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  loading: any = null;

  constructor(
    public loadingController: LoadingController
  ) { }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Por favor, espere...',
    });
    return await this.loading.present();
  }

  closeLoading(){
    return this.loading.dismiss();
  }
}

import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../user.model';
import { UserQueries } from '../../services/user.queries';
import { NzMessageService } from 'ng-zorro-antd/message';

export class UserProfileForm {
  id: string;
  username: string;
  photoUrl?: string;
  _file?: File;
  user: User;

  constructor(user: User) {
    this.id = user.id;
    this.username = user.username;
    this.photoUrl = user.photoUrl;
    this.user = user;
  }

  get file() {
    return this._file;
  }

  set file(file: File | undefined) {
    this._file = file;
    if (file) {
      this.toBase64(file).then(s => {
        this.photoUrl = s;
      })
    }
  }

  toBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  hasChanged(): boolean {
    return !!this.file || this.username !== this.user.username
  }
}

@Component({
  selector: 'app-user-profile-modal',
  templateUrl: './user-profile-modal.component.html',
  styleUrls: ['./user-profile-modal.component.less']
})
export class UserProfileModalComponent implements OnInit {
  @Input()
  user: User;

  @ViewChild("f")
  form: NgForm;
  supportedTypes = "";
  isVisible: boolean = false;
  model: UserProfileForm;

  constructor(private userService: UserService, private sanitizer: DomSanitizer, private nzMessageService: NzMessageService, private userQueries: UserQueries) {

  }

  ngOnInit(): void {
    this.model = new UserProfileForm(this.user);
  }

  get photoUrl(): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.model.photoUrl || "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Unknown_person.jpg/434px-Unknown_person.jpg");
  }

  async onOk() {
    const username = this.model.username
    const picture = this.model.file
    // TODO vérifier si le formulaire est valide
    if (this.model.hasChanged()) {
      if (username != this.user.username && await this.isUsedName(this.model.username)) {
        this.nzMessageService.error("Ce nom est déjà pris, veuillez en choisir un autre")
        return
      }
      // TODO mettre à jour l'utilisateur via le service
      try{
        await this.userService.update({id: this.model.id, username: this.model.username, photo: this.model.file})
      } catch (error) {
        this.nzMessageService.error('Nous avons rencontré un problème. Veuillez retenter plus tard');
      }
      // this.userService.update({
      //   id: this.user.id,
      //   username: username,
      //   photo: picture,
      // });
    }

    this.close();
  }

  async isUsedName(psd: string): Promise<boolean> {
    return await this.userQueries.exists(psd)
  }

  onFileUpload = (file: File) => {
    this.model.file = file;
    return false;
  }

  onCancel() {
    this.close();
  }

  open() {
    this.model = new UserProfileForm(this.user);
    this.isVisible = true;

    setTimeout(() => {
      this.form.resetForm(this.model);
    })
  }

  close() {
    this.isVisible = false;
  }
}
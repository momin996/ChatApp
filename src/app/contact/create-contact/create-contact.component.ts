import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-create-contact',
  templateUrl: './create-contact.component.html',
  styleUrl: './create-contact.component.scss'
})
export class CreateContactComponent {
  constructor(
    public dialogRef: MatDialogRef<CreateContactComponent>
) {}

close(){
    this.dialogRef.close(true);
}
}

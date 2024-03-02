import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

// Material Dependencies Import
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatRippleModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';

// Misc Imports
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { NgChartsModule } from 'ng2-charts';
import { NgxEditorModule } from 'ngx-editor';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgxGaugeModule } from 'ngx-gauge';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { ColorPickerModule } from 'ngx-color-picker';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FullCalendarModule } from '@fullcalendar/angular';
import { QuillModule } from 'ngx-quill';




const MaterialModules = [
  MatMenuModule,
  MatCardModule,
  MatTableModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatButtonModule,
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSlideToggleModule,
  MatSliderModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
  MatNativeDateModule,
]

const MiscLibraryModule = [
  FormsModule,
  ReactiveFormsModule,
  NgApexchartsModule,
  NgScrollbarModule,
  NgChartsModule,
  NgxEditorModule,
  NgxGaugeModule,
  NgxMatTimepickerModule,
  NgxDropzoneModule,
  CarouselModule,
  CdkAccordionModule,
  ColorPickerModule,
  DragDropModule,
  FullCalendarModule,
]

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    
    ...MaterialModules,

    
    ...MiscLibraryModule,
    NgxEchartsModule.forRoot({
        echarts: () => import('echarts')
    }),
    QuillModule.forRoot(),
  ],
  exports: [
    CommonModule,
    ...MaterialModules,
    ...MiscLibraryModule,
    NgxEchartsModule,
    QuillModule,
  ],
  providers: [
    DatePipe
  ],
})
export class SharedModule { }

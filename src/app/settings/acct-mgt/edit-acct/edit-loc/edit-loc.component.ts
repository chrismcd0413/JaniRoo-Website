import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { TimeZoneService } from 'src/app/Shared Services/timezone.service';

@Component({
  selector: 'app-edit-loc',
  templateUrl: './edit-loc.component.html',
  styleUrls: ['./edit-loc.component.css'],
})
export class EditLocComponent implements OnInit, AfterViewInit {
  title = 'Edit';
  locationForm: FormGroup;
  apiLoaded: Observable<boolean>;
  mapOptions: google.maps.MapOptions = {
    zoom: 12,
    disableDefaultUI: true,
    fullscreenControl: false,
  };
  @ViewChild('addressInput') addressInput: ElementRef;
  @ViewChild('map') map: GoogleMap;
  autocompleteOptions = {
    fields: ['formatted_address', 'geometry.location'],
    componentRestrictions: { country: 'us' },
    type: ['street_address'],
  };
  mapMarker: google.maps.LatLngLiteral;
  markerOptions: google.maps.MarkerOptions = { draggable: false };
  circleCenter: google.maps.LatLngLiteral;
  radius = 150;
  archiveButton;
  tzId;
  constructor(
    public dialogRef: MatDialogRef<EditLocComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private httpClient: HttpClient,
    private tz: TimeZoneService
  ) {}
  ngAfterViewInit(): void {
    console.log('Input', this.addressInput);
    const autocomplete = new google.maps.places.Autocomplete(
      this.addressInput.nativeElement,
      this.autocompleteOptions
    );
    autocomplete.addListener('place_changed', () => {
      const place: google.maps.places.PlaceResult = autocomplete.getPlace();
      this.changeAddress(place);
    });
  }
  ngOnInit(): void {
    this.locationForm = new FormGroup({
      name: new FormControl('', {
        validators: [Validators.required],
      }),
      geo: new FormControl('', {
        validators: [],
      }),
      radius: new FormControl(this.radius, {
        validators: [],
      }),
      a1: new FormControl('', {
        validators: [Validators.required],
      }),
      a2: new FormControl('', {
        validators: [],
      }),
      notes: new FormControl('', {
        validators: [],
      }),
    });
    if (this.data.editMode) {
      console.log(this.data);
      this.title = 'Edit';
      this.locationForm.setValue({
        name: this.data.location.name,
        geo: this.data.location.geo_enabled,
        radius: this.data.location.geo_radius,
        a1: this.data.location.address.formatted_address,
        a2: this.data.location.address.address2,
        notes: this.data.location.address.notes,
      });
      this.radius = this.data.location.geo_radius;
      this.setAddress(this.data.location.address.geo);
      console.log(this.data.location.active);
      if (this.data.location.active) {
        console.log('Set button to archive');
        this.archiveButton = 'Archive';
      } else {
        console.log('Set button to unarchive');
        this.archiveButton = 'Unarchive';
      }
    } else {
      this.title = 'New';
    }
  }
  onSubmit() {
    this.dialogRef.close({
      editMode: this.data.editMode,
      id: this.data.id,
      changeToSave: true,
      data: {
        name: this.locationForm.value.name,
        geo_enabled: this.locationForm.value.geo,
        geo_radius: this.locationForm.value.radius,
        a2: this.locationForm.value.a2,
        formatted_address: this.locationForm.value.a1,
        notes: this.locationForm.value.notes,
        latlng: this.mapMarker,
        tzId: this.tzId
      },
      active: true,
    });
  }
  closeDialog(bool, loc) {
    this.dialogRef.close({
      editMode: this.data.editMode,
      changesToSave: false,
    });
  }
  archiveLocation() {
    console.log(!this.data.location.active);
    this.dialogRef.close({
      editMode: this.data.editMode,
      id: this.data.id,
      changeToSave: true,
      data: {
        name: this.locationForm.value.name,
        geo_enabled: this.locationForm.value.geo,
        geo_radius: this.locationForm.value.radius,
        a2: this.locationForm.value.a2,
        formatted_address: this.locationForm.value.a1,
        notes: this.locationForm.value.notes,
        latlng: this.mapMarker,
        tzId: this.tzId
      },
      active: !this.data.location.active,
    });
  }
  setAddress(a) {
    this.mapOptions.center = a;
    this.mapMarker = a;
    this.circleCenter = a;
  }
  changeAddress(p) {
    this.locationForm.patchValue({ a1: p.formatted_address });
    const position: google.maps.LatLngLiteral = {
      lat: p.geometry.location.lat(),
      lng: p.geometry.location.lng(),
    };
    this.tz.getCurrentTzId(position).subscribe(r => {
      this.tzId = r.timeZoneId;
    });
    this.mapMarker = position;
    this.circleCenter = position;
    this.map.panTo(position);
  }
  changeRadius(c) {
    this.radius = c.value;
    console.log(c);
  }
}

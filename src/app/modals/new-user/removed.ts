// this.userForm = new FormGroup({
//   name: new FormControl('', {
//     validators: [Validators.required],
//   }),
//   email: new FormControl('', {
//     validators: [Validators.required, Validators.email],
//   }),
//   phone: new FormControl('', {
//     validators: [Validators.required],
//   }),
//   role: new FormControl(null, {
//     validators: [Validators.required],
//   }),
//   address1: new FormControl('', {
//     validators: [],
//   }),
//   address2: new FormControl('', {
//     validators: [],
//   }),
//   city: new FormControl('', {
//     validators: [],
//   }),
//   state: new FormControl('', {
//     validators: [],
//   }),
//   zip: new FormControl('', {
//     validators: [],
//   }),
// });
// if (this.data.editMode) {
//   this.userForm.setValue({
//     name: this.data.user.name,
//     email: this.data.user.email,
//     phone: this.data.user.phone_number,
//     role: this.data.user.role,
//     address1: this.data.user.address.address1,
//     address2: this.data.user.address.address2,
//     city: this.data.user.address.city,
//     state: this.data.user.address.state,
//     zip: this.data.user.address.zip,
//   });
//   console.log(this.data.user);
// } else {
//   this.userForm.addControl(
//     'password',
//     new FormControl('', {
//       validators: [Validators.required],
//     })
//   );
// }

// addNewTempLocationPermission(fd: FormGroupDirective) {
//   // this.tempLocationPermissions.push(f);

//   this.tempLocationPermissions.push(this.tempLocationForm.value);
//   this.dataSource.data = this.tempLocationPermissions;
//   fd.resetForm();
//   this.tempLocationForm.reset();
//   this.tempLocationForm.setValue({
//     inventory: false,
//     inspections: false,
//     location: null,
//     pay_rate: null,
//     pay_type: null,
//   });
//   // console.log('Temp Loc Form Submitted', this.tempLocationForm);
// }
// generateLocationValue(loc, act) {
//   const temp = {
//     name: act.name + ' - ' + loc.name,
//     id: loc.id,
//   };
//   return temp;
// }
// changeValue(type: string, i: number, status: boolean) {
//   if (type === 'inventory') {
//     this.tempLocationPermissions[i].inventory = status;
//   }
//   if (type === 'inspection') {
//     this.tempLocationPermissions[i].inspections = status;
//   }
//   console.log('New Permissions', this.tempLocationPermissions);
// }
// removeTempPermissions(i) {
//   this.tempLocationPermissions.splice(i, 1);
//   this.dataSource.data = this.tempLocationPermissions;
// }
// disableOptionsForExistingPermissions(loc) {
//   return this.tempLocationPermissions.some((l) => l.location.id === loc.id);
// }

// displayedColumns = ['name', 'inventory', 'inspection', 'pay', 'actions'];
// dataSource = new MatTableDataSource<any>();
// accounts = [];
// tempLocationPermissions = [];

// this.subs.push(
//   this.infoService.accounts.subscribe((a) => {
//     this.accounts = a;
//   })
// );
// this.dataSource.data = this.tempLocationPermissions;

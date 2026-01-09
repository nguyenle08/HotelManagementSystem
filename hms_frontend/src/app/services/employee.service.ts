import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private api = 'http://localhost:8082/api/manager/employees';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(this.api);
  }

  create(emp: any) {
    return this.http.post(this.api, emp);
  }

  update(id: string, emp: any) {
    return this.http.put(`${this.api}/${id}`, emp);
    }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  lock(id: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/lock`, {});
  }

  unlock(id: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/unlock`, {});
  }
}

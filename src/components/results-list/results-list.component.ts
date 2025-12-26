import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobSalary } from '../../services/salary-data.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-results-list',
  templateUrl: './results-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ResultsListComponent {
  jobs = input.required<JobSalary[]>();
  public translations = inject(TranslationService);
}

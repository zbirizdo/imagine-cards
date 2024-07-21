import { CommonModule } from '@angular/common';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleSheetsDbService } from 'ng-google-sheets-db';
import { map, Observable, tap } from 'rxjs';

const clueAttributesMapping = {
  id: "Id",
  category: "Category",
  expression: "Expression"
};

interface Clue {
  id: number;
  category: string;
  expression: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'imagine-cards';

  clues$!: Observable<Clue[]>;

  card: {
    front: Clue[]
    back: Clue[]
  } = {
    front: [...Array(8).keys()].map((key) => ({ id: key, category: '...', expression: '...' })),
    back: [...Array(8).keys()].map((key) => ({ id: key, category: '...', expression: '...' })),
  }

  constructor(private googleSheetsDbService: GoogleSheetsDbService) { }

  ngOnInit(): void {
    this.clues$ = this.googleSheetsDbService.getActive<Clue>(
      '1r1oDjrgLMdIsmiAu4H3sIM5RXgN3FgIaeO4F5uh714I', "Clues", clueAttributesMapping, "Active"
    ).pipe(
      map(clues => this.shuffleArray(clues)),
      tap(clues => {
        this.card.front = clues.slice(0, 8)
        this.card.back = clues.slice(8, 16)
      })
    );
  }

  shuffleArray(array: any[]) {
    return array.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  }
}

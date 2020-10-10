import { Component, OnInit } from '@angular/core';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.css']
})
export class BookmarksComponent implements OnInit {

  bookmarkData: any;

  constructor(
    private interaction: InteractionService
  ) { }

  ngOnInit(): void {
    this.getBookmarks();
  }

  getBookmarks() {
    this.interaction.getAllPosts()
      .subscribe((res: any) => {
        this.bookmarkData = res.filter(item => {
          return item.bookmark === true;
        });
      });
  }

  stopDefaultBehaviour(e): void {
    e.preventDefault();
    e.stopPropagation();
  }

}

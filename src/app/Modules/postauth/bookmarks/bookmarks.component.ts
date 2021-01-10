
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DateService } from 'src/app/services/date.service';
import { InteractionService } from 'src/app/services/interaction.service';

@Component({
  selector: 'app-bookmarks',
  templateUrl: './bookmarks.component.html',
  styleUrls: ['./bookmarks.component.css']
})
export class BookmarksComponent implements OnInit {

  bookmarkData: any;

  constructor(
    private interaction: InteractionService,
    private date: DateService,
    private router: Router
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
        console.log('BOOKMARK: ', this.bookmarkData);
      });
  }

  stopDefaultBehaviour(e): void {
    e.preventDefault();
    e.stopPropagation();
  }

  routeToBlogDetail(e: any, postid): void { 
    this.router.navigate(['/detail'], {
      queryParams: {
        id: postid,
        userId: 1
      }
    });
  }

}

import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Post } from '../../post.model';
import { PostService } from '../../services/post.service';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.less']
})
export class PostComponent implements OnInit, AfterViewInit {
  @Input()
  post: Post;
  public postDate: string

  @ViewChild("anchor")
  anchor: ElementRef<HTMLDivElement>;

  constructor(
    private postService: PostService
  ) { }

  ngOnInit(): void {
    DateTime.fromISO(this.post.createdAt as string).toLocal().toRelative() as string;
  }

  ngAfterViewInit() {
    this.anchor.nativeElement.scrollIntoView();
  }

  async like() {
    // TODO like du post
    await this.postService.like(this.post);
  }
}

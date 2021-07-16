import { Pipe, PipeTransform } from '@angular/core';
import { PostService } from '../services/post.service';
import { UpdateService } from '../services/update.service';

@Pipe({
  name: 'image'
})
export class ImagePipe implements PipeTransform {

  constructor(
    private updateService: UpdateService,
    private postService: PostService
  ) {}

  transform(value: string, imageType: string): unknown {
    switch(imageType) {
      case 'profile-image': 
        return this.updateService.getProfileImage(value.trim());
        break;
      
        case 'post-image': 
          return this.postService.getPostImage(value.trim());
          break;

        default: 
          return;
          break;
    }
  }

}

/* 
    This is a DTO for the friends service. It is used to define the shape of the data that will be sent to the service. (Friend request and response)
*/

import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

export class FriendDto {
    @IsMongoId()
    @IsNotEmpty()
    requester: string;
    
    @IsMongoId()
    @IsNotEmpty()
    recipient: string;
    
    // @IsEnum(['pending', 'accepted', 'rejected'])
    status?: 'pending' | 'accepted' | 'rejected';
}



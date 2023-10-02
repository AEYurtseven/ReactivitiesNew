import { makeAutoObservable, reaction, runInAction } from "mobx";
import { Photo, Profile } from "../models/profiles";
import agent from "../api/agent";
import { store } from "./store";

export default class ProfileStore{
    profile: Profile | null = null;
    loadingProfile = false;
    uploading = false;
    loading = false;
    followings: Profile[] = [];
    loadingFollowings: boolean = false;
    activeTab = 0;

    constructor(){
        makeAutoObservable(this);

        reaction(
            () => this.activeTab,
            activeTab => {
                if(activeTab === 3 || activeTab === 4){
                    const predicate = activeTab === 3 ? 'followers' : 'following';
                    this.loadFollowings(predicate);
                }else{
                    this.followings = [];
                }
            }
        )
    }

    
    get isCurrentUser(){
        if(store.userStore.user && this.profile){
            return store.userStore.user.userName === this.profile.userName;
        }
        return false;
    }

    
    setActiveTab = (activeTab: number) => {
        this.activeTab = activeTab;
    }

    loadProfile = async (username: string) => {
        this.loadingProfile = true;
        try{
            const profile = await agent.Profiles.get(username);
            runInAction(() => {
                this.profile = profile;
                this.loadingProfile = false;
            });
            
        }catch(error){
            console.log(error);
            runInAction(() => this.loadingProfile = false);
        }
    }

    updateProfile = async (profile: Partial<Profile>) => {
        this.loading = true; 
        try{
            await agent.Profiles.updateProfile(profile);
            if(profile.displayName && profile.displayName !== store.userStore.user?.displayName){
                store.userStore.setDisplayName(profile.displayName);
            }
            this.profile = {...this.profile, ...profile as Profile};
            this.loading = false;
        }catch(error){
            console.log(error);
            runInAction(() => this.loading = false);
        }
    }

    uploadPhoto = async (file:Blob) => {
        this.uploading = true;
        try{
            const response = await agent.Profiles.uploadPhoto(file);
            const photo = response.data;
            runInAction(() => {
                if(this.profile) {
                    this.profile.photos?.push(photo);
                     if(photo.isMain && store.userStore.user){
                        store.userStore.setImage(photo.url);
                        this.profile.image = photo.url;
                     }
                }
                this.uploading = false;
            })
        }catch(error){
            console.log(error); 
            runInAction(() => this.uploading = false);
        }
    }

    setMainPhoto = async (photo: Photo) => {
        this.loading = true;
        try{
            await agent.Profiles.setMainPhoto(photo.id);
            runInAction(() => {
                if(this.profile && this.profile.photos) {
                    this.profile.photos.find(p => p.isMain)!.isMain = false;
                    this.profile.photos.find(p => p.id === photo.id)!.isMain = true;
                    this.profile.image = photo.url;
                    this.loading = false;
                }
            })
        }catch(error){
            runInAction(() => this.loading = false);
            console.log(error);
        }
    }

    deletePhoto = async (photo: Photo) => {
        this.loading = true;
        try{
            await agent.Profiles.deletePhoto(photo.id);
            runInAction(() => {
                if(this.profile){
                    this.profile.photos = this.profile.photos?.filter(p => p.id !== photo.id);
                }
            })
        }catch(error) {
            runInAction(() => this.loading = false);
            console.log(error);
        }
    }

    updateFollowing = async (username: string, following: boolean) => {
        this.loading = true;
        try{
            await agent.Profiles.updateFollowing(username);
            store.activityStore.updateAttendeeFollowing(username);
            runInAction(() => {
                if(this.profile && this.profile.userName !== store.userStore.user?.userName && this.profile.userName === username){
                    following ? this.profile.followerCount++ : this.profile.followerCount--;
                    this.profile.following = !this.profile.following;
                }
                if(this.profile && this.profile.userName === store.userStore.user?.userName){
                    following ? this.profile.followerCount++ : this.profile.followingCount--;
                }
                this.followings.forEach(profile => {
                    if(profile.userName === username) {
                        profile.following ? profile.followerCount-- : profile.followerCount++;
                        profile.following = !profile.following;
                    }
                })
                this.loading = false;
            });
        }catch(error){
            console.log(error);
            runInAction(() => this.loading = false);
        }
    }

    loadFollowings = async (predicate: string) => {
        this.loadingFollowings = true;
        try{
            const followings = await agent.Profiles.listFollwings(this.profile!.userName, predicate);
            console.log("followings:", followings);
            runInAction(() => {
                this.followings = followings;
                this.loadingFollowings = false;
            })
        }catch(error){
            console.log(error);
            runInAction(() => this.loadingFollowings = false);
        }
    }
}
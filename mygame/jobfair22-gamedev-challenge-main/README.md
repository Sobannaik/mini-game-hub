<h4>Setup:</h4>

- [Install Unity 2020.3.34f1](https://unity3d.com/get-unity/download/archive)
- [Fork Repository to your GitHub](https://github.com/Nordeus/jobfair22-gamedev-challenge) 
- **Import forked Project** to Unity and make sure to select the **WebGL platform** before opening 
- Development resolution in GameView should be 1920x1080
 
<h4>Game Description:</h4>

We are kicking off our challenge by taking over Unity's template of the [karting game](https://assetstore.unity.com/packages/templates/karting-microgame-150956). For controls, we use standard keys: WASD/arrows. You can try out the gameplay by opening the IntroMenu scene and going into play mode.

<img src="https://user-images.githubusercontent.com/18152364/199502978-6441e921-4973-4638-92b9-c55654e6cd04.png" width="600" height="341" />

During the race, you can open the Pause menu by clicking Tab/P. In the Pause menu, you can choose to see controls or to go back to the Intro scene. 

<img src="https://user-images.githubusercontent.com/18152364/199503244-acafb3ce-7040-4552-9efc-25af724b044b.png" width="600" height="341" />

By controlling PlayerKart, you can move through the current track. Or you can try it out in our WebGL build: **https://nordeus.github.io/jobfair22-gamedev-challenge/**

![](https://github.com/Nordeus/jobfair22-gamedev-challenge/blob/main/gameplay.gif)

<h4>Tech Description:</h4> 

The project consists of two scenes: **IntroMenu** (from which we start the game) and **MainScene** (which is used for gameplay).

The **IntroMenu** scene is used for displaying the **Play** button and opening the **Controls Panel**. 

**MainScene** contains a 3D environment, Kart Player and Game UI. The **Kart Player** object has multiple scripts attached that can be used for customisation and controlling of players. Make sure to check them out. **Game UI** object is holding UI for Pause Panel and Controls Panel. Feel free to create your canvas for UI or edit existing ones. 

There is **no restriction regarding removing/changing code** - do whatever is necessary for you to show us what a **FAST & FUN RACING GAME** should look like! 

![image](https://user-images.githubusercontent.com/18152364/199521196-a5e84e78-836e-4cd9-9d63-684940962fd2.png)

<h5>Building your game for the WebGL platform:</h5>

- On your local machine, create a new WebGL build version into the folder: /docs and push it to the main branch
- Open your project on the GitHub
- Go to Settings / Code and automation / Pages
- For Branch, select main & for the folder, select /docs and press the Save button

**Make sure to create and push the latest version of your game before submitting your GitHub link for WebGL build.**  

<h4>Challenge Description:</h4> 

We want the players to have a complete racing experience. Make them feel fast, win against others, beat their best lap time, and have fun. As you can tell, the naked project we are using is not doing an excellent job with that. We want the core gameplay to be more fun, and this is your chance to help us and show your skills! 

For a racing game, there are a few things you can think about: 
- The player needs to feel fast - [Why Racing Games Feel Slow](https://www.youtube.com/watch?v=e9OriySqLjQ)
- Track design makes a big difference - [What Makes a Great Mario Kart Track?](https://www.youtube.com/watch?v=0ooVR2ghIpk)
- Players love completing objectives and having different winning conditions
- Beating AI opponents or playing local multiplayer
- Additional gameplay mechanics: boosters, nitro, etc.

<h4>Goal:</h4> 

Show us what a **FUN & FAST RACING GAME** is for you! Feel free to add more features, new tracks, improve mechanics, boosters, multiplayer, or whatever your creative mind wants! 

<h4>Submitting results:</h4> 

You should send an e-mail to **jobfair@nordeus.com** with the following:
- Link to your WebGL build
- Explanation of what you added, game goal, controls, etc.
- Bonus: video of your gameplay is more than welcomed 

<h4>Additional Resources:</h4> 

- [SQUASH & STRETCH - The 12 Principles of Animation in Games](https://www.youtube.com/watch?v=1kFRU_xBZnE&list=PLugegG07di3886WYN6u7v9BeBd0VFG3_J&index=2) - think about how you could use these principles to enhance the player experience
- [Kart Racers - Designing Fun for Everyone ~ Design Doc](https://www.youtube.com/watch?v=P8S176RmRJg)	


**Good Luck!**

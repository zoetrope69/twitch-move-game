# twitch-move-game [![Netlify Status](https://api.netlify.com/api/v1/badges/0860d985-f917-4d2a-9014-4cd252ed229b/deploy-status)](https://app.netlify.com/sites/twitch-move-game/deploys)

a [twitch game overlay](https://clips.twitch.tv/ModernCrepuscularCucumberKevinTurtle-ept7hB8MxvwIKiyh) for OBS, for [rosco](https://www.twitch.tv/rosco)

## using in OBS

there's two ways, using the online link or downloading. downloading the files will be more reliable as you won't need to download anything on the fly and if the website goes down it will 100% work. the downside to downloading is you'll need to download each time if there's updates. you could have both and keep the local version as a backup.

both options use the `Browser` source with the following settings:

| Option | Value                            |
| ------ | -------------------------------- |
| URL    | https://twitch-move-game.netlify.app?channel=rosco <- replace this with your channel |
| FPS    | 60                               |
| Width  | 1280                             |
| Height | 720                              |
| ✅     | Shutdown source when not visible |
| ✅     | Refresh browser when not visible |

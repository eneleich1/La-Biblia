import googleapiclient.discovery
import googleapiclient.errors

# 1. PON TUS DATOS AQUÍ (Dentro de las comillas)
ID_DEL_CANAL = "UC_QURQ-J12nQJvo-JnrJ2cA"    # El que empieza con UC...
API_KEY_GOOGLE = "AIzaSyBPWuEnIKvzY-TZ19AOIOtCbJr63SDWLp4" # La que copiaste de Google Cloud

def obtener_videos_youtube():
    print("Conectando con YouTube... Por favor, espera.")
    
    # Aquí es donde el script utiliza tu API KEY para conectar
    youtube = googleapiclient.discovery.build("youtube", "v3", developerKey=API_KEY_GOOGLE)
    
    try:
        # Usamos tu ID de canal para buscar la lista de videos subidos
        request = youtube.channels().list(part="contentDetails", id=ID_DEL_CANAL)
        response = request.execute()
        
        if not response.get("items"):
            print("Error: No se encontró el canal. Revisa si el ID es correcto.")
            return
            
        uploads_id = response["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
        
        next_page_token = None
        total_videos = 0
        nombre_archivo = "mis_videos_youtube.txt"
        
        # Creamos y escribimos el archivo de texto plano (.txt)
        with open(nombre_archivo, "w", encoding="utf-8") as f:
            f.write("LISTA DE VÍDEOS DE YOUTUBE\n")
            f.write("="*50 + "\n\n")
            
            while True:
                playlist_request = youtube.playlistItems().list(
                    part="snippet",
                    playlistId=uploads_id,
                    maxResults=50,
                    pageToken=next_page_token
                )
                playlist_response = playlist_request.execute()
                
                for item in playlist_response.get("items", []):
                    titulo = item["snippet"]["title"]
                    video_id = item["snippet"]["resourceId"]["videoId"]
                    url_video = f"https://www.youtube.com/watch?v={video_id}"
                    
                    # Guardamos el formato en el archivo plano
                    f.write(f"Título: {titulo}\n")
                    f.write(f"Enlace: {url_video}\n")
                    f.write("-" * 40 + "\n")
                    total_videos += 1
                
                next_page_token = playlist_response.get("nextPageToken")
                if not next_page_token:
                    break
                    
        print(f"\n¡Éxito! Archivo '{nombre_archivo}' generado con {total_videos} vídeos.")
        
    except Exception as e:
        print(f"\nOcurrió un error: {e}")

# 2. AQUÍ SE LLAMA A LA FUNCIÓN PARA QUE CORRA AUTOMÁTICAMENTE
if __name__ == "__main__":
    obtener_videos_youtube()
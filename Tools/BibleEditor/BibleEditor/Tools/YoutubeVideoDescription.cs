using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace BibleEditor.Tools
{
    public class YoutubeVideoDescription
    {
        [XmlElement]
        public string Date { get;set; }

        [XmlElement]
        public string ChapterName { get; set; }
        [XmlElement]
        public string Description { get; set; }
        [XmlElement]
        public string Comment { get; set; }
        [XmlElement]
        public string LinkToBible { get; set; }
        [XmlElement]
        public string Tags { get; set; }

        [XmlElement]
        public List<VideoDescription> OtherVideos { get; set;}

    }

    public class VideoDescription
    {
        public string Name { get; set; }
        public string Link { get; set; }
    }

    public class Topic
    {
        public static bool ValidTopic(Topic topic)
        {
            return !(topic == null || topic.Number == null || topic.Description == null || topic.Number == "" || topic.Description == "");
        }
        public string Number { get; set; }
        public string Description { get; set; }
    }
}

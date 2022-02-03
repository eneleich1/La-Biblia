using BibleEditor.Pages;
using BibleEditor.Tools;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace BibleEditor
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            Configuration.LoadConfiguration();

            if (Configuration.MainConfiguration.LoadDefaultComponent)
            {
                switch (Configuration.MainConfiguration.DefaultComponent)
                {
                    case "CreateChapters":
                        content_grid.Children.Add(new CreateBibleChapterFromTextPage());
                        break;
                }
            }
        }
        private void getChapters_menu_Click(object sender, RoutedEventArgs e)
        {
            content_grid.Children.Clear();
            content_grid.Children.Add(new CreateBibleChapterFromTextPage());
        }

        private void createDescription_menu_Click(object sender, RoutedEventArgs e)
        {
            content_grid.Children.Clear();
            content_grid.Children.Add(new CreateYoutubeVideoDescriptionPage());
        }
    }
}

using System;
using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Ink;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using Microsoft.Win32;

namespace ImageViewerApp;

public partial class MainWindow : Window
{
    private enum InteractionMode
    {
        None,
        Draw,
        Crop
    }

    private WriteableBitmap? _currentBitmap;
    private InteractionMode _mode = InteractionMode.None;
    private Point? _cropStart;
    private bool _isDraggingCrop;

    public MainWindow()
    {
        InitializeComponent();
        DrawingCanvas.DefaultDrawingAttributes = new DrawingAttributes
        {
            Color = Colors.OrangeRed,
            Width = 4,
            Height = 4,
            FitToCurve = false,
            IgnorePressure = true
        };

        DrawingCanvas.EditingMode = InkCanvasEditingMode.None;
        WorkspaceRoot.MouseLeftButtonDown += OnWorkspaceMouseDown;
        WorkspaceRoot.MouseMove += OnWorkspaceMouseMove;
        WorkspaceRoot.MouseLeftButtonUp += OnWorkspaceMouseUp;
    }

    private void OnOpenImageClicked(object sender, RoutedEventArgs e)
    {
        var dialog = new OpenFileDialog
        {
            Filter = "Image files|*.png;*.jpg;*.jpeg;*.bmp;*.gif;*.tif;*.tiff|All files|*.*"
        };

        if (dialog.ShowDialog() == true)
        {
            using var stream = new FileStream(dialog.FileName, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
            var bitmap = new BitmapImage();
            bitmap.BeginInit();
            bitmap.CacheOption = BitmapCacheOption.OnLoad;
            bitmap.StreamSource = stream;
            bitmap.EndInit();
            bitmap.Freeze();

            SetImageSource(bitmap);
        }
    }

    private void OnRotateLeftClicked(object sender, RoutedEventArgs e) => RotateImage(-90);

    private void OnRotateRightClicked(object sender, RoutedEventArgs e) => RotateImage(90);

    private void OnDrawToggleChanged(object sender, RoutedEventArgs e)
    {
        if (DrawToggle.IsChecked == true)
        {
            CropToggle.IsChecked = false;
            _mode = InteractionMode.Draw;
            DrawingCanvas.IsEnabled = true;
            DrawingCanvas.EditingMode = InkCanvasEditingMode.Ink;
            Cursor = Cursors.Pen;
        }
        else
        {
            _mode = InteractionMode.None;
            DrawingCanvas.EditingMode = InkCanvasEditingMode.None;
            DrawingCanvas.IsEnabled = false;
            Cursor = Cursors.Arrow;
        }
    }

    private void OnCropToggleChanged(object sender, RoutedEventArgs e)
    {
        if (CropToggle.IsChecked == true)
        {
            DrawToggle.IsChecked = false;
            DrawingCanvas.IsEnabled = false;
            DrawingCanvas.EditingMode = InkCanvasEditingMode.None;
            _mode = InteractionMode.Crop;
            Cursor = Cursors.Cross;
        }
        else
        {
            _mode = InteractionMode.None;
            Cursor = Cursors.Arrow;
            ClearCropSelection();
        }
    }

    private void OnClearDrawingsClicked(object sender, RoutedEventArgs e)
    {
        DrawingCanvas.Strokes.Clear();
    }

    private void RotateImage(double angle)
    {
        if (_currentBitmap is null)
        {
            return;
        }

        var flattened = FlattenWorkspaceToBitmap();
        var transform = new RotateTransform(angle);
        var transformed = new TransformedBitmap(flattened, transform);
        transformed.Freeze();
        SetImageSource(transformed);
    }

    private void OnWorkspaceMouseDown(object sender, MouseButtonEventArgs e)
    {
        if (_mode != InteractionMode.Crop || _currentBitmap is null)
        {
            return;
        }

        _cropStart = e.GetPosition(WorkspaceRoot);
        _isDraggingCrop = true;
        UpdateCropRectangle(_cropStart.Value, _cropStart.Value);
    }

    private void OnWorkspaceMouseMove(object sender, MouseEventArgs e)
    {
        if (!_isDraggingCrop || _mode != InteractionMode.Crop || _currentBitmap is null || _cropStart is null)
        {
            return;
        }

        var current = e.GetPosition(WorkspaceRoot);
        UpdateCropRectangle(_cropStart.Value, current);
    }

    private void OnWorkspaceMouseUp(object sender, MouseButtonEventArgs e)
    {
        if (!_isDraggingCrop || _mode != InteractionMode.Crop || _currentBitmap is null || _cropStart is null)
        {
            return;
        }

        _isDraggingCrop = false;
        var end = e.GetPosition(WorkspaceRoot);
        ApplyCrop(_cropStart.Value, end);
        ClearCropSelection();
        CropToggle.IsChecked = false;
    }

    private void SetImageSource(BitmapSource source)
    {
        _currentBitmap = new WriteableBitmap(source);
        MainImage.Source = _currentBitmap;
        WorkspaceRoot.Width = _currentBitmap.PixelWidth;
        WorkspaceRoot.Height = _currentBitmap.PixelHeight;
        DrawingCanvas.Width = _currentBitmap.PixelWidth;
        DrawingCanvas.Height = _currentBitmap.PixelHeight;
        ClearCropSelection();
        DrawingCanvas.Strokes.Clear();
    }

    private void ApplyCrop(Point start, Point end)
    {
        if (_currentBitmap is null)
        {
            return;
        }

        var rect = BuildInt32Rect(start, end, _currentBitmap.PixelWidth, _currentBitmap.PixelHeight);
        if (rect.Width <= 0 || rect.Height <= 0)
        {
            return;
        }

        var flattened = FlattenWorkspaceToBitmap();
        var cropped = new CroppedBitmap(flattened, rect);
        cropped.Freeze();
        SetImageSource(cropped);
    }

    private static Int32Rect BuildInt32Rect(Point start, Point end, int maxWidth, int maxHeight)
    {
        var x1 = Math.Clamp((int)Math.Round(start.X), 0, maxWidth);
        var y1 = Math.Clamp((int)Math.Round(start.Y), 0, maxHeight);
        var x2 = Math.Clamp((int)Math.Round(end.X), 0, maxWidth);
        var y2 = Math.Clamp((int)Math.Round(end.Y), 0, maxHeight);

        var left = Math.Min(x1, x2);
        var top = Math.Min(y1, y2);
        var right = Math.Max(x1, x2);
        var bottom = Math.Max(y1, y2);

        return new Int32Rect(left, top, Math.Max(0, right - left), Math.Max(0, bottom - top));
    }

    private void UpdateCropRectangle(Point start, Point end)
    {
        var left = Math.Min(start.X, end.X);
        var top = Math.Min(start.Y, end.Y);
        var width = Math.Abs(start.X - end.X);
        var height = Math.Abs(start.Y - end.Y);

        CropRectangle.Visibility = Visibility.Visible;
        CropRectangle.Width = width;
        CropRectangle.Height = height;
        Canvas.SetLeft(CropRectangle, left);
        Canvas.SetTop(CropRectangle, top);
    }

    private void ClearCropSelection()
    {
        CropRectangle.Visibility = Visibility.Collapsed;
        _cropStart = null;
        _isDraggingCrop = false;
    }

    private WriteableBitmap FlattenWorkspaceToBitmap()
    {
        if (_currentBitmap is null)
        {
            throw new InvalidOperationException("No image loaded.");
        }

        WorkspaceRoot.Measure(new Size(_currentBitmap.PixelWidth, _currentBitmap.PixelHeight));
        WorkspaceRoot.Arrange(new Rect(0, 0, _currentBitmap.PixelWidth, _currentBitmap.PixelHeight));
        WorkspaceRoot.UpdateLayout();

        var rtb = new RenderTargetBitmap(
            _currentBitmap.PixelWidth,
            _currentBitmap.PixelHeight,
            _currentBitmap.DpiX,
            _currentBitmap.DpiY,
            PixelFormats.Pbgra32);

        rtb.Render(WorkspaceRoot);
        rtb.Freeze();
        return new WriteableBitmap(rtb);
    }
}

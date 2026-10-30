using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

public class BuildWebGLForSite
{
    public static void BuildCurrent()
    {
        var outputDir = Path.GetFullPath("C:/mini-game-hub/public/3d-games/survival-shooter");
        Directory.CreateDirectory(outputDir);

        PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Disabled;

        var scenes = EditorBuildSettings.scenes
            .Where(scene => scene.enabled)
            .Select(scene => scene.path)
            .ToArray();

        if (scenes.Length == 0)
        {
            throw new Exception("No enabled scenes found for WebGL build.");
        }

        var options = new BuildPlayerOptions
        {
            scenes = scenes,
            locationPathName = outputDir,
            target = BuildTarget.WebGL,
            options = BuildOptions.None
        };

        var report = BuildPipeline.BuildPlayer(options);
        if (report.summary.result != BuildResult.Succeeded)
        {
            throw new Exception($"WebGL build failed: {report.summary.result} - {report.summary.totalErrors} errors");
        }

        Debug.Log($"WebGL build succeeded to {outputDir}");
    }
}

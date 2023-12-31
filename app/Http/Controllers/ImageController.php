<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImageController extends Controller
{
    public function index($id)
    {
        $images = Image::where('watch_id', $id)->get();
        return view('admin.watch.image')->with('images', $images);
    }

    public function list($watchId)
    {
        $images = Image::where('watch_id', $watchId)->get();
        return response()->json([
            'message' => 'Images retrieved successfully',
            'images' => $images
        ], 200);
    }

    public function store(Request $request, $watchId)
    {
        try {
            // Check if name is exist
            $check = Image::where('name', $request->input('name'))->first();
            if ($check) {
                return response()->json(['message' => 'Image name already exist'], 400);
            }
            $imagePath = $request->file('image')->store('public/images');

            $image = new Image();
            $image->name = $request->input('name');
            $image->stock = $request->input('stock');
            $image->image_url = $imagePath;
            $image->watch_id = $watchId;
            $image->save();

            return response()->json([
                'message' => 'Image created successfully',
                'image' => $image
            ], 201);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Image created failed',
                'error' => $th
            ], 400);
        }
    }

    public function getImage($id)
    {
        $image = Image::find($id);
        if (is_null($image)) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        $filePath = $image->image_url;
        $imagePath = Storage::disk('')->path($filePath);
        $headers = ['Content-Type' => mime_content_type($imagePath)];

        return new StreamedResponse(function () use ($imagePath) {
            readfile($imagePath);
        }, 200, $headers);
    }

    public function show($id)
    {
        $image = Image::find($id);
        if (is_null($image)) {
            return response()->json(['message' => 'Image not found'], 404);
        }
        return response()->json([
            'message' => 'Image retrieved successfully',
            'image' => $image
        ], 200);
    }

    public function update(Request $request, $id)
    {
        try {
            $image = Image::find($id);
            if (is_null($image)) {
                return response()->json(['message' => 'Image not found'], 404);
            }
            // Check if name is exist
            $check = Image::where('name', $request->input('name'))->first();
            if ($check && $check->id != $id) {
                return response()->json(['message' => 'Image name already exist'], 400);
            }
            if ($request->hasFile('image')) {
                // Delete the existing image from storage
                Storage::disk('')->delete($image->image_url);

                // Store the new image
                $imagePath = $request->file('image')->store('public/images');

                $image->name = $request->input('name');
                $image->stock = $request->input('stock');
                $image->image_url = $imagePath;
            } else {
                $image->name = $request->input('name');
                $image->stock = $request->input('stock');
            }
            $image->save();
            return response()->json([
                'message' => 'Image updated successfully',
                'image' => $image
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'Image updated failed',
                'error' => $th
            ], 400);
        }
    }

    public function destroy($id)
    {
        // Logic to delete a user by ID
        $image = Image::find($id);
        if (is_null($image)) {
            return response()->json(['message' => 'Image not found'], 404);
        }
        // Delete the existing image from storage
        Storage::disk('')->delete($image->image_url);

        $image->delete();
        return response()->json(['message' => 'Image was deleted'], 200);
    }
}

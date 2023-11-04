from flask import Flask, render_template, request, url_for, redirect, send_from_directory, jsonify, abort

@app.route('/')
def index():
	return app.send_static_file('index.html')

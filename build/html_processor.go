package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
)

// ProcessHtml processes the HTML string and replaces each img tag with inline SVG content
func ProcessHtml(html string, handler func(string) (string, error)) (string, error) {
	imgTagRegex := regexp.MustCompile(`<img\s+[^>]*src="([^"]+\.svg)"[^>]*>`)
	matches := imgTagRegex.FindAllStringSubmatch(html, -1)
	if matches == nil {
		return html, nil
	}

	var wg sync.WaitGroup
	type result struct {
		original string
		newTag   string
		err      error
	}
	results := make(chan result, len(matches))

	for _, match := range matches {
		wg.Add(1)
		go func(original, src string) {
			defer wg.Done()
			newTag, err := handler(src)
			results <- result{original, newTag, err}
		}(match[0], match[1])
	}

	go func() {
		wg.Wait()
		close(results)
	}()

	processedHtml := html
	for res := range results {
		if res.err != nil {
			return "", res.err
		}
		processedHtml = strings.Replace(processedHtml, res.original, res.newTag, 1)
	}

	return processedHtml, nil
}

// ReadSvgFile reads the content of an SVG file
func ReadSvgFile(svgPath string) (string, error) {
	content, err := ioutil.ReadFile(svgPath)
	if err != nil {
		return "", err
	}
	return string(content), nil
}

// ProcessHtmlFilesInDirectory processes all HTML files in a directory and writes the output to another directory
func ProcessHtmlFilesInDirectory(htmlDir, svgDir, outputDir string) error {
	files, err := ioutil.ReadDir(htmlDir)
	if err != nil {
		return err
	}

	for _, file := range files {
		if filepath.Ext(file.Name()) == ".html" {
			htmlPath := filepath.Join(htmlDir, file.Name())
			htmlContent, err := ioutil.ReadFile(htmlPath)
			if err != nil {
				return err
			}

			handler := func(src string) (string, error) {
				svgPath := filepath.Join(svgDir, src)
				svgContent, err := ReadSvgFile(svgPath)
				if err != nil {
					return "", err
				}
				return svgContent, nil
			}

			processedHtml, err := ProcessHtml(string(htmlContent), handler)
			if err != nil {
				return err
			}

			outputPath := filepath.Join(outputDir, file.Name())
			err = ioutil.WriteFile(outputPath, []byte(processedHtml), 0644)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func main() {
	htmlDir := flag.String("htmlDir", "", "Directory containing HTML files")
	svgDir := flag.String("svgDir", "", "Directory containing SVG files")
	outputDir := flag.String("outputDir", "", "Directory to write the processed HTML files")

	flag.Parse()

	if *htmlDir == "" || *svgDir == "" || *outputDir == "" {
		fmt.Println("htmlDir, svgDir, and outputDir arguments are required.")
		flag.Usage()
		os.Exit(1)
	}

	err := ProcessHtmlFilesInDirectory(*htmlDir, *svgDir, *outputDir)
	if err != nil {
		fmt.Printf("Error processing HTML files: %v\n", err)
		os.Exit(1)
	} else {
		fmt.Println("Successfully processed HTML files.")
	}
}

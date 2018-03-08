<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html"/>
    <xsl:template match="/">
        <script type="text/javascript" src="js/xmlvalidation.js"> </script> 
        <form method="post" id="xmlform">
            <xsl:for-each select="FIELDS/GROUP">
                <div class="panel panel-default">
                    <xsl:for-each select="PANELHEADER">
                        <div>
                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                <xsl:attribute name="{@name}">
                                    <xsl:value-of select="current()"/>
                                </xsl:attribute>
                            </xsl:for-each>
                            <b> 
                                <xsl:value-of select="VALUE"/> 
                            </b>
                        </div>
                    </xsl:for-each>
                
                    <xsl:for-each select="PANELBODY">
                        <div class="panel-body">
                            <xsl:for-each select="FIELD">
                                <xsl:choose>
                                    
                                    <!-- TherapistName Text Box -->
                                    <xsl:when test="@type='TextBox' and @id='TherapistName'">
                                        <div class="form-group">
                                            <div class="col-sm-4 col-sm-offset-8">
                                                <input type="text">
                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                        <xsl:attribute name="{@name}">
                                                            <xsl:value-of select="current()"/>
                                                        </xsl:attribute>
                                                    </xsl:for-each>
                                                </input>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:when>
                                    
                                    <!-- Main Header2 -->
                                    <xsl:when test="@type='Header2'">
                                        <div class="col-sm-12">
                                            <h2>
                                                <span class="label bg-dark"> 
                                                    <xsl:value-of select="@label"/> 
                                                </span>
                                            </h2>
                                        </div>
                                    </xsl:when>
                                    
                                    <!-- Main Text Box With DropDownList-->
                                    <xsl:when test="@type='TextBoxDDL'">
                                        <div class="form-group">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                                <xsl:if test="@required='true'">
                                                    <span class="required"> *</span>
                                                </xsl:if>
                                            </label>
                                            <div class="col-sm-9">
                                                <div class="row">
                                                    <div class="col-sm-6">
                                                        <input type="text">
                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                <xsl:attribute name="{@name}">
                                                                    <xsl:value-of select="current()"/>
                                                                </xsl:attribute>
                                                            </xsl:for-each>
                                                        </input>
                                                    </div>
                                                    <div class="col-sm-6">
                                                        <select>
                                                            <xsl:for-each select="FIELD/PROPERTIES/PROPERTY">
                                                                <xsl:attribute name="{@name}">
                                                                    <xsl:value-of select="current()"/>
                                                                </xsl:attribute>
                                                            </xsl:for-each>
                                                            <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                <option>
                                                                    <xsl:attribute name="value">
                                                                        <xsl:value-of select="@value"/>
                                                                    </xsl:attribute>
                                                                    <xsl:if test="@Selected = 'true'">
                                                                        <xsl:attribute name="selected">
                                                                            <xsl:text>selected</xsl:text>
                                                                        </xsl:attribute>
                                                                    </xsl:if>
                                                                    <xsl:value-of select="@value"/>
                                                                </option>
                                                            </xsl:for-each>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:when>
                                    
                                    
                                    <!-- Main DropDownList-->
                                    <xsl:when test="@type='DropDownList'">
                                        <div class="form-group">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                                <xsl:if test="@required='true'">
                                                    <span class="required"> *</span>
                                                </xsl:if>
                                            </label>
                                            <div class="col-sm-9">
                                                <select>
                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                        <xsl:attribute name="{@name}">
                                                            <xsl:value-of select="current()"/>
                                                        </xsl:attribute>
                                                    </xsl:for-each>
                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                        <option>
                                                            <xsl:attribute name="value">
                                                                <xsl:value-of select="@value"/>
                                                            </xsl:attribute>
                                                            <xsl:if test="@Selected = 'true'">
                                                                <xsl:attribute name="selected">
                                                                    <xsl:text>selected</xsl:text>
                                                                </xsl:attribute>
                                                            </xsl:if>
                                                            <xsl:value-of select="@value"/>
                                                        </option>
                                                    </xsl:for-each>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:when>
                                    
                                    <!-- Main MultiDropdown list -->
                                    <xsl:when test="@type='MultiDropDownList'">
                                        <div class="form-group">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                                <xsl:if test="@required='true'">
                                                    <span class="required"> *</span>
                                                </xsl:if>
                                            </label>
                                            <div class="col-sm-9">
                                                <select multiple='true'>
                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                        <xsl:attribute name="{@name}">
                                                            <xsl:value-of select="current()"/>
                                                        </xsl:attribute>
                                                    </xsl:for-each>
                                                                                                                                
                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                        <option>
                                                            <xsl:attribute name="value">
                                                                <xsl:value-of select="@value"/>
                                                            </xsl:attribute>
                                                            <xsl:if test="@Selected = 'true'">
                                                                <xsl:attribute name="selected">
                                                                    <xsl:text>selected</xsl:text>
                                                                </xsl:attribute>
                                                            </xsl:if>
                                                            <xsl:value-of select="@value"/>
                                                        </option>
                                                    </xsl:for-each>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:when>
                                    
                                    <!-- Main Text Box -->
                                    <xsl:when test="@type='TextBox'">
                                        <div class="form-group">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                                <xsl:if test="@required='true'">
                                                    <span class="required"> *</span>
                                                </xsl:if>
                                            </label>
                                            <div class="col-sm-4">
                                                <input type="text">
                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                        <xsl:attribute name="{@name}">
                                                            <xsl:value-of select="current()"/>
                                                        </xsl:attribute>
                                                    </xsl:for-each>
                                                </input>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:when> 
                                    
                                    <!-- Main Text Area-->
                                    <xsl:when test="@type='TextArea'">
                                        <div class="form-group">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                                <xsl:if test="@required='true'">
                                                    <span class="required"> *</span>
                                                </xsl:if>
                                            </label>
                                            <div class="col-sm-9">
                                                <textarea>
                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                        <xsl:attribute name="{@name}">
                                                            <xsl:value-of select="current()"/>
                                                        </xsl:attribute>
                                                    </xsl:for-each>
                                                    <xsl:value-of select="VALUE"/>
                                                </textarea>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:when> 
                                    
                                    <!-- Main Radio Button -->                          
                                    <xsl:when test="@type='RadioButtonList'">
                                        <div class="form-group">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                                <xsl:if test="@required='true'">
                                                    <span class="required"> *</span>
                                                </xsl:if>
                                                <a title="clear" class="panelbar_clear pull-right" data-divid="{@id}">
                                                    <i class="fa fa-trash"/>
                                                </a>
                                            </label>
                                            <div class="col-sm-9">
                                                <xsl:attribute name="id">
                                                    <xsl:value-of select="@id"/>
                                                </xsl:attribute>
                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                    <input type="radio">
                                                        <xsl:attribute name="value">
                                                            <xsl:value-of select="@value"/>
                                                        </xsl:attribute>
                                                        <xsl:attribute name="id">
                                                            <xsl:value-of select="@id"/>
                                                        </xsl:attribute>
                                                        <xsl:if test="@Selected = 'true'">
                                                            <xsl:attribute name="checked">
                                                                <xsl:text>checked</xsl:text>
                                                            </xsl:attribute>
                                                        </xsl:if>
                                                        <xsl:attribute name="onclick">
                                                            <xsl:value-of select="@onclick"/>
                                                        </xsl:attribute>
                                                        <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                            <xsl:attribute name="{@name}">
                                                                <xsl:value-of select="current()"/>
                                                            </xsl:attribute>
                                                        </xsl:for-each>
                                                    </input>
                                                     
                                                    <label for="{@id}">
                                                        <xsl:value-of select="current()"/>
                                                    </label>  
                                                </xsl:for-each>
                                                <xsl:if test="FIELD">
                                                    <div>
                                                        <xsl:attribute name="id">
                                                            <xsl:value-of select="@Backdivid"/>
                                                        </xsl:attribute>
                                                        <xsl:attribute name="class">
                                                            <xsl:value-of select="@Backcontrols"/>
                                                        </xsl:attribute>
                                                        <xsl:for-each select="FIELD">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='TextBox'">
                                                                    <xsl:value-of select="@label"/>
                                                                    <input type="text">
                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                            <xsl:attribute name="{@name}">
                                                                                <xsl:value-of select="current()"/>
                                                                            </xsl:attribute>
                                                                        </xsl:for-each>
                                                                    </input>
                                                                </xsl:when>
                                                            
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <xsl:value-of select="@label"/> 
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <input type="radio">
                                                                            <xsl:attribute name="value">
                                                                                <xsl:value-of select="@value"/>
                                                                            </xsl:attribute>
                                                                            <xsl:attribute name="id">
                                                                                <xsl:value-of select="@id"/>
                                                                            </xsl:attribute>
                                                                            <xsl:if test="@Selected = 'true'">
                                                                                <xsl:attribute name="checked">
                                                                                    <xsl:text>checked</xsl:text>
                                                                                </xsl:attribute>
                                                                            </xsl:if>
                                                                            <xsl:attribute name="onclick">
                                                                                <xsl:value-of select="@onclick"/>
                                                                            </xsl:attribute>
                                                                            <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                <xsl:attribute name="{@name}">
                                                                                    <xsl:value-of select="current()"/>
                                                                                </xsl:attribute>
                                                                            </xsl:for-each>
                                                                        </input>
                                                                         
                                                                        <label for="{@id}">
                                                                            <xsl:value-of select="current()"/>
                                                                        </label>  
                                                                    </xsl:for-each>
                                                                </xsl:when>
                                                            
                                                                <xsl:when test="@type='DropDownList'">
                                                                    <xsl:value-of select="@label"/>  
                                                                    <select style="width:auto;">
                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                            <xsl:attribute name="{@name}">
                                                                                <xsl:value-of select="current()"/>
                                                                            </xsl:attribute>
                                                                        </xsl:for-each>
                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                            <option>
                                                                                <xsl:attribute name="value">
                                                                                    <xsl:value-of select="@value"/>
                                                                                </xsl:attribute>
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:attribute name="selected">
                                                                                        <xsl:text>selected</xsl:text>
                                                                                    </xsl:attribute>
                                                                                </xsl:if>
                                                                                <xsl:value-of select="@value"/>
                                                                            </option>
                                                                        </xsl:for-each>
                                                                    </select>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </div>
                                                    
                                                </xsl:if>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:when>
                                
                                    <!-- Main Checkbox -->
                                    <xsl:when test="@type='CheckBoxList'">
                                        <div class="form-group">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                                <xsl:if test="@required='true'">
                                                    <span class="required"> *</span>
                                                </xsl:if>
                                            </label>
                                            <div class="col-sm-9">
                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                    <div class='check_box_list'>
                                                        <input type="checkbox">
                                                            <xsl:attribute name="value">
                                                                <xsl:value-of select="@value"/>
                                                            </xsl:attribute>
                                                            <xsl:attribute name="id">
                                                                <xsl:value-of select="@id"/>
                                                            </xsl:attribute>
                                                            <xsl:if test="@Selected = 'true'">
                                                                <xsl:attribute name="checked">
                                                                    <xsl:text>checked</xsl:text>
                                                                </xsl:attribute>
                                                            </xsl:if>
                                                            <xsl:attribute name="onclick">
                                                                <xsl:value-of select="@onclick"/>
                                                            </xsl:attribute>
                                                            <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                <xsl:attribute name="{@name}">
                                                                    <xsl:value-of select="current()"/>
                                                                </xsl:attribute>
                                                            </xsl:for-each>
                                                        </input>
                                                         
                                                        <label for="{@id}">
                                                            <xsl:value-of select="current()"/>
                                                        </label>
                                                    </div>  
                                                </xsl:for-each>
                                                <xsl:if test="FIELD">
                                                    <div>
                                                        <xsl:attribute name="id">
                                                            <xsl:value-of select="@Backdivid"/>
                                                        </xsl:attribute>
                                                        <xsl:attribute name="class">
                                                            <xsl:value-of select="@Backcontrols"/>
                                                        </xsl:attribute>
                                                        <xsl:for-each select="FIELD">
                                                            <xsl:choose>
                                                                <xsl:when test="@type='TextBox'">
                                                                    <xsl:value-of select="@label"/>
                                                                    <input type="text">
                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                            <xsl:attribute name="{@name}">
                                                                                <xsl:value-of select="current()"/>
                                                                            </xsl:attribute>
                                                                        </xsl:for-each>
                                                                    </input>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </div>
                                                </xsl:if>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:when>
                                    
                                    <!-- Main Textarea Full -->
                                    <xsl:when test="@type='textareaFull'">
                                        <div class="form-group">
                                            <div class="col-sm-12">
                                                <label>
                                                    <xsl:value-of select="@label"/>
                                                </label>
                                                <textarea>
                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                        <xsl:attribute name="{@name}">
                                                            <xsl:value-of select="current()"/>
                                                        </xsl:attribute>
                                                    </xsl:for-each>
                                                    <xsl:value-of select="VALUE"/>
                                                </textarea>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:when>
                                
                                    <!-- Main Grid -->
                                    <xsl:when test="@type='RadGrid'">
                                        <div class="form-group">
                                            <div class="col-sm-12">
                                                
                                                <div class="form-group">
                                                    <table>
                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                            <xsl:attribute name="{@name}">
                                                                <xsl:value-of select="current()"/>
                                                            </xsl:attribute>
                                                        </xsl:for-each>
                                                        <thead>
                                                            <tr>
                                                                <xsl:for-each select="HEADER/TH">
                                                                    <th>
                                                                        <xsl:value-of select="current()"/>
                                                                    </th>
                                                                </xsl:for-each>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <xsl:for-each select="COLUMNS">
                                                                <tr>
                                                                    <xsl:for-each select="FIELD">
                                                                        <td>
                                                                            <xsl:choose>
                                                                                <!-- Grid Main TextBox-->
                                                                                <xsl:when test="@type='TextBox'">
                                                                                    <input type="text">
                                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                            <xsl:attribute name="{@name}">
                                                                                                <xsl:value-of select="current()"/>
                                                                                            </xsl:attribute>
                                                                                        </xsl:for-each>
                                                                                    </input>
                                                                                </xsl:when>
                                                                            
                                                                                <!-- Grid Main Text Box With DropDownList-->
                                                                                <xsl:when test="@type='TextBoxDDL'">
                                                                                    <div class="row">
                                                                                        <div class="col-sm-6">
                                                                                            <input type="text">
                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                    <xsl:attribute name="{@name}">
                                                                                                        <xsl:value-of select="current()"/>
                                                                                                    </xsl:attribute>
                                                                                                </xsl:for-each>
                                                                                            </input>
                                                                                        </div>
                                                                                        <div class="col-sm-6">
                                                                                            <select>
                                                                                                <xsl:for-each select="FIELD/PROPERTIES/PROPERTY">
                                                                                                    <xsl:attribute name="{@name}">
                                                                                                        <xsl:value-of select="current()"/>
                                                                                                    </xsl:attribute>
                                                                                                </xsl:for-each>
                                                                                                <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                                    <option>
                                                                                                        <xsl:attribute name="value">
                                                                                                            <xsl:value-of select="@value"/>
                                                                                                        </xsl:attribute>
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                            <xsl:attribute name="selected">
                                                                                                                <xsl:text>selected</xsl:text>
                                                                                                            </xsl:attribute>
                                                                                                        </xsl:if>
                                                                                                        <xsl:value-of select="@value"/>
                                                                                                    </option>
                                                                                                </xsl:for-each>
                                                                                            </select>
                                                                                        </div>
                                                                                    </div>
                                                                                </xsl:when>
                                    
                                                                                <!-- Grid Main DropDownList-->
                                                                                <xsl:when test="@type='DropDownList'">
                                                                                    <select>
                                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                            <xsl:attribute name="{@name}">
                                                                                                <xsl:value-of select="current()"/>
                                                                                            </xsl:attribute>
                                                                                        </xsl:for-each>
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                            <option>
                                                                                                <xsl:attribute name="value">
                                                                                                    <xsl:value-of select="@value"/>
                                                                                                </xsl:attribute>
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                    <xsl:attribute name="selected">
                                                                                                        <xsl:text>selected</xsl:text>
                                                                                                    </xsl:attribute>
                                                                                                </xsl:if>
                                                                                                <xsl:value-of select="@value"/>
                                                                                            </option>
                                                                                        </xsl:for-each>
                                                                                    </select>
                                                                                </xsl:when>
                                                                    
                                                                                <!-- Grid Main RadioButton-->
                                                                                <xsl:when test="@type='RadioButtonList'">
                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                        <input type="radio">
                                                                                            <xsl:attribute name="value">
                                                                                                <xsl:value-of select="@value"/>
                                                                                            </xsl:attribute>
                                                                                            <xsl:attribute name="id">
                                                                                                <xsl:value-of select="@id"/>
                                                                                            </xsl:attribute>
                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                <xsl:attribute name="checked">
                                                                                                    <xsl:text>checked</xsl:text>
                                                                                                </xsl:attribute>
                                                                                            </xsl:if>
                                                                                            <xsl:attribute name="onclick">
                                                                                                <xsl:value-of select="@onclick"/>
                                                                                            </xsl:attribute>
                                                                                            <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                <xsl:attribute name="{@name}">
                                                                                                    <xsl:value-of select="current()"/>
                                                                                                </xsl:attribute>
                                                                                            </xsl:for-each>
                                                                                        </input>
                                                                                         
                                                                                        <label for="{@id}">
                                                                                            <xsl:value-of select="current()"/>
                                                                                        </label>  
                                                                                    </xsl:for-each>
                                                                                    <xsl:if test="FIELD">
                                                                                        <div>
                                                                                            <xsl:attribute name="id">
                                                                                                <xsl:value-of select="@Backdivid"/>
                                                                                            </xsl:attribute>
                                                                                            <xsl:attribute name="class">
                                                                                                <xsl:value-of select="@Backcontrols"/>
                                                                                            </xsl:attribute>
                                                                                            <xsl:for-each select="FIELD">
                                                                                                <xsl:choose>
                                                                                                    <xsl:when test="@type='TextBox'">
                                                                                                        <xsl:value-of select="@label"/>
                                                                                                        <input type="text">
                                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                <xsl:attribute name="{@name}">
                                                                                                                    <xsl:value-of select="current()"/>
                                                                                                                </xsl:attribute>
                                                                                                            </xsl:for-each>
                                                                                                        </input>
                                                                                                    </xsl:when>
                                                                                                </xsl:choose>
                                                                                            </xsl:for-each>
                                                                                        </div>
                                                                                    </xsl:if>
                                                                                </xsl:when>
                                                                            </xsl:choose>
                                                                        </td>
                                                                    </xsl:for-each>
                                                                </tr>
                                                            </xsl:for-each>
                                                
                                                        </tbody>
                                                    </table>
                                                </div>
                                                
                                                <xsl:if test="@ADDButton='True'">
                                                    <input type="button">
                                                        <xsl:attribute name="class">
                                                            <xsl:text>addMore btn btn-info pull-right</xsl:text>
                                                        </xsl:attribute>
                                                        <xsl:attribute name="value">
                                                            <xsl:text>Add</xsl:text>
                                                        </xsl:attribute>
                                                        <xsl:attribute name="id">
                                                            <xsl:value-of select="@ADDButtonID"/>
                                                        </xsl:attribute>
                                                        <xsl:attribute name="data-table-id">
                                                            <xsl:value-of select="@AddButtonTableId"/>
                                                        </xsl:attribute>
                                                    </input>
                                                </xsl:if>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:when>
                                    
                                    <!-- Main Panel Bar -->
                                    <xsl:when test="@type='PanelBar'">
                                        <div class="panel panel-default">
                                            <div class="panel-heading">
                                                <h4 class="panel-title">
                                                    <a class="accordion-toggle" data-toggle="collapse" data-target="#{@target_div}" href="javascript:void(0)">
                                                        <span>
                                                            <xsl:value-of select="@label"/>
                                                        </span>
                                                        <i class="pull-right fa fa-angle-right font-bold"/>
                                                    </a>
                                                </h4>
                                            </div>
                                            <div id="{@target_div}" class="collapse panel-body">
                                                <xsl:if test="@target_div != 'personal_history'">
                                                    <div>
                                                        <a class="panelbar_clear pull-right" data-divid="{@target_div}">Clear</a>
                                                    </div>
                                                </xsl:if>
                                                <xsl:for-each select="FIELD">
                                                    <xsl:choose>
                                                        <xsl:when test="@type='PanelBar'">
                                                            <div class="panel panel-default">
                                                                <div class="panel-heading">
                                                                    <h4 class="panel-title">
                                                                        <a class="accordion-toggle" data-toggle="collapse" onclick='Checkvisible("{@target_div}",event);' data-target="#{@target_div}" href="javascript:void(0)">
                                                                            <input type="checkbox"/>
                                                                            <span>
                                                                                <xsl:value-of select="@label"/>
                                                                            </span>
                                                                            <i class="pull-right fa fa-angle-right font-bold"/>
                                                                        </a>
                                                                    </h4>
                                                                </div>
                                                                <div id="{@target_div}" class="collapse panel-body">
                                                                    <div>
                                                                        <a class="panelbar_clear pull-right" data-divid="{@target_div}">Clear</a>
                                                                    </div>
                                                                    <xsl:for-each select="FIELD">
                                                                        <xsl:choose>
                                                                            <xsl:when test="@type='Header2'">
                                                                                <div class="col-sm-12">
                                                                                    <h2>
                                                                                        <span class="label bg-dark"> 
                                                                                            <xsl:value-of select="@label"/> 
                                                                                        </span>
                                                                                    </h2>
                                                                                </div>
                                                                            </xsl:when>
                                                        
                                                                            <!-- Panel Bar Main Grid -->
                                                                            <xsl:when test="@type='RadGrid'">
                                                                                <div class="form-group">
                                                                                    <div class="col-sm-12">
                                                                                        <div class="form-group">
                                                                                            <table name="check_drop">
                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                    <xsl:attribute name="{@name}">
                                                                                                        <xsl:value-of select="current()"/>
                                                                                                    </xsl:attribute>
                                                                                                </xsl:for-each>
                                                                                                <thead>
                                                                                                    <tr>
                                                                                                        <xsl:for-each select="HEADER/TH">
                                                                                                            <th>
                                                                                                                <xsl:value-of select="current()"/>
                                                                                                            </th>
                                                                                                        </xsl:for-each>
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody>
                                                                                                    <xsl:for-each select="COLUMNS">
                                                                                                        <tr>
                                                                                                            <xsl:for-each select="FIELD">
                                                                                                                <td>
                                                                                                                    <xsl:choose>
                                                                                                                        <xsl:when test="@type='TextBox'">
                                                                                                                            <input type="text">
                                                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                                    <xsl:attribute name="{@name}">
                                                                                                                                        <xsl:value-of select="current()"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                </xsl:for-each>
                                                                                                                            </input>
                                                                                                                        </xsl:when>
                                                                                                
                                                                                                                        <!--Panel Bar Grid Main Text Box With DropDownList-->
                                                                                                                        <xsl:when test="@type='TextBoxDDL'">
                                                                                                                            <div class="row">
                                                                                                                                <div class="col-sm-6">
                                                                                                                                    <input type="text">
                                                                                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                                            <xsl:attribute name="{@name}">
                                                                                                                                                <xsl:value-of select="current()"/>
                                                                                                                                            </xsl:attribute>
                                                                                                                                        </xsl:for-each>
                                                                                                                                    </input>
                                                                                                                                </div>
                                                                                                                                <div class="col-sm-6">
                                                                                                                                    <select>
                                                                                                                                        <xsl:for-each select="FIELD/PROPERTIES/PROPERTY">
                                                                                                                                            <xsl:attribute name="{@name}">
                                                                                                                                                <xsl:value-of select="current()"/>
                                                                                                                                            </xsl:attribute>
                                                                                                                                        </xsl:for-each>
                                                                                                                                        <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                                                                            <option>
                                                                                                                                                <xsl:attribute name="value">
                                                                                                                                                    <xsl:value-of select="@value"/>
                                                                                                                                                </xsl:attribute>
                                                                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                                                                    <xsl:attribute name="selected">
                                                                                                                                                        <xsl:text>selected</xsl:text>
                                                                                                                                                    </xsl:attribute>
                                                                                                                                                </xsl:if>
                                                                                                                                                <xsl:value-of select="@value"/>
                                                                                                                                            </option>
                                                                                                                                        </xsl:for-each>
                                                                                                                                    </select>
                                                                                                                                </div>
                                                                                                                            </div>
                                                                                                                        </xsl:when>
                                                                    
                                                                                                                        <xsl:when test="@type='DropDownList'">
                                                                                                                            <select>
                                                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                                    <xsl:attribute name="{@name}">
                                                                                                                                        <xsl:value-of select="current()"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                </xsl:for-each>
                                                                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                                    <option>
                                                                                                                                        <xsl:attribute name="value">
                                                                                                                                            <xsl:value-of select="@value"/>
                                                                                                                                        </xsl:attribute>
                                                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                                                            <xsl:attribute name="selected">
                                                                                                                                                <xsl:text>selected</xsl:text>
                                                                                                                                            </xsl:attribute>
                                                                                                                                        </xsl:if>
                                                                                                                                        <xsl:value-of select="@value"/>
                                                                                                                                    </option>
                                                                                                                                </xsl:for-each>
                                                                                                                            </select>
                                                                                                                        </xsl:when>
                                                                                                                        
                                                                                                                        <xsl:when test="@type='DropDowntextbox'">
                                                                                                                            <select>
                                                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                                    <xsl:attribute name="{@name}">
                                                                                                                                        <xsl:value-of select="current()"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                </xsl:for-each>
                                                                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                                    <option>
                                                                                                                                        <xsl:attribute name="value">
                                                                                                                                            <xsl:value-of select="@value"/>
                                                                                                                                        </xsl:attribute>
                                                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                                                            <xsl:attribute name="selected">
                                                                                                                                                <xsl:text>selected</xsl:text>
                                                                                                                                            </xsl:attribute>
                                                                                                                                        </xsl:if>
                                                                                                                                        <xsl:value-of select="@value"/>
                                                                                                                                    </option>
                                                                                                                                </xsl:for-each>
                                                                                                                            </select>
                                                                                                                            <xsl:if test="FIELD">
                                                                                                                                <div>
                                                                                                                                    <xsl:attribute name="id">
                                                                                                                                        <xsl:value-of select="@Backdivid"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                    <xsl:attribute name="class">
                                                                                                                                        <xsl:value-of select="@Backcontrols"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                    <xsl:for-each select="FIELD">
                                                                                                                                        <xsl:choose>
                                                                                                                                            <xsl:when test="@type='TextBox'">
                                                                                                                                                <xsl:value-of select="@label"/>
                                                                                                                                                <input type="text">
                                                                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                                                        <xsl:attribute name="{@name}">
                                                                                                                                                            <xsl:value-of select="current()"/>
                                                                                                                                                        </xsl:attribute>
                                                                                                                                                    </xsl:for-each>
                                                                                                                                                </input>
                                                                                                                                            </xsl:when>
                                                                                                                                        </xsl:choose>
                                                                                                                                    </xsl:for-each>
                                                                                                                                </div>
                                                                                                                            </xsl:if>
                                                                                                                        </xsl:when>
                                                                    
                                                                                                                        <xsl:when test="@type='RadioButtonList'">
                                                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                                <input type="radio">
                                                                                                                                    <xsl:attribute name="value">
                                                                                                                                        <xsl:value-of select="@value"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                    <xsl:attribute name="id">
                                                                                                                                        <xsl:value-of select="@id"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                                                                        <xsl:attribute name="checked">
                                                                                                                                            <xsl:text>checked</xsl:text>
                                                                                                                                        </xsl:attribute>
                                                                                                                                    </xsl:if>
                                                                                                                                    <xsl:attribute name="onclick">
                                                                                                                                        <xsl:value-of select="@onclick"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                    <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                                                        <xsl:attribute name="{@name}">
                                                                                                                                            <xsl:value-of select="current()"/>
                                                                                                                                        </xsl:attribute>
                                                                                                                                    </xsl:for-each>
                                                                                                                                </input>
                                                                                                                                 
                                                                                                                                <label for="{@id}">
                                                                                                                                    <xsl:value-of select="current()"/>
                                                                                                                                </label>  
                                                                                                                            </xsl:for-each>
                                                                                                                            <xsl:if test="FIELD">
                                                                                                                                <div>
                                                                                                                                    <xsl:attribute name="id">
                                                                                                                                        <xsl:value-of select="@Backdivid"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                    <xsl:attribute name="class">
                                                                                                                                        <xsl:value-of select="@Backcontrols"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                    <xsl:for-each select="FIELD">
                                                                                                                                        <xsl:choose>
                                                                                                                                            <xsl:when test="@type='TextBox'">
                                                                                                                                                <xsl:value-of select="@label"/>
                                                                                                                                                <input type="text">
                                                                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                                                        <xsl:attribute name="{@name}">
                                                                                                                                                            <xsl:value-of select="current()"/>
                                                                                                                                                        </xsl:attribute>
                                                                                                                                                    </xsl:for-each>
                                                                                                                                                </input>
                                                                                                                                            </xsl:when>
                                                                                                                                        </xsl:choose>
                                                                                                                                    </xsl:for-each>
                                                                                                                                </div>
                                                                                                                            </xsl:if>
                                                                                                                        </xsl:when>
                                                                                                
                                                                                                                        <xsl:when test="@type='CheckBoxList'">
                                                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                                <input type="checkbox">
                                                                                                                                    <xsl:attribute name="value">
                                                                                                                                        <xsl:value-of select="@value"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                    <xsl:attribute name="id">
                                                                                                                                        <xsl:value-of select="@id"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                                                                        <xsl:attribute name="checked">
                                                                                                                                            <xsl:text>checked</xsl:text>
                                                                                                                                        </xsl:attribute>
                                                                                                                                    </xsl:if>
                                                                                                                                    <xsl:attribute name="onclick">
                                                                                                                                        <xsl:value-of select="@onclick"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                    <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                                                        <xsl:attribute name="{@name}">
                                                                                                                                            <xsl:value-of select="current()"/>
                                                                                                                                        </xsl:attribute>
                                                                                                                                    </xsl:for-each>
                                                                                                                                </input>
                                                                                                                                 
                                                                                                                                <label for="{@id}">
                                                                                                                                    <xsl:value-of select="current()"/>
                                                                                                                                </label>  
                                                                                                                            </xsl:for-each>
                                                                                                                        </xsl:when>
                                                                                                                    </xsl:choose>
                                                                                                                </td>
                                                                                                            </xsl:for-each>
                                                                                                        </tr>
                                                                                                    </xsl:for-each>
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                    
                                                                                        <xsl:if test="@ADDButton='True'">
                                                                                            <input type="button">
                                                                                                <xsl:attribute name="class">
                                                                                                    <xsl:text>addMore btn btn-info pull-right</xsl:text>
                                                                                                </xsl:attribute>
                                                                                                <xsl:attribute name="value">
                                                                                                    <xsl:text>Add</xsl:text>
                                                                                                </xsl:attribute>
                                                                                                <xsl:attribute name="id">
                                                                                                    <xsl:value-of select="@ADDButtonID"/>
                                                                                                </xsl:attribute>
                                                                                                <xsl:attribute name="data-table-id">
                                                                                                    <xsl:value-of select="@AddButtonTableId"/>
                                                                                                </xsl:attribute>
                                                                                            </input>
                                                                                        </xsl:if>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="line line-dashed b-b line-lg "/>
                                                                            </xsl:when>
                                                        
                                                                            <!-- Panel Bar Main Radio Button -->
                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                <div class="form-group">
                                                                                    <label class="col-sm-3 control-label">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <xsl:if test="@required='true'">
                                                                                            <span class="required"> *</span>
                                                                                        </xsl:if>
                                                                                        <a title="clear" class="panelbar_clear pull-right" data-divid="{@id}">
                                                                                            <i class="fa fa-trash"/>
                                                                                        </a>
                                                                                    </label>  
                                                                                    <div class="col-sm-8">
                                                                                        <xsl:attribute name="id">
                                                                                            <xsl:value-of select="@id"/>
                                                                                        </xsl:attribute>
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                            <input type="radio">
                                                                                                <xsl:attribute name="value">
                                                                                                    <xsl:value-of select="@value"/>
                                                                                                </xsl:attribute>
                                                                                                <xsl:attribute name="id">
                                                                                                    <xsl:value-of select="@id"/>
                                                                                                </xsl:attribute>
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                    <xsl:attribute name="checked">
                                                                                                        <xsl:text>checked</xsl:text>
                                                                                                    </xsl:attribute>
                                                                                                </xsl:if>
                                                                                                <xsl:attribute name="onclick">
                                                                                                    <xsl:value-of select="@onclick"/>
                                                                                                </xsl:attribute>
                                                                                                <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                    <xsl:attribute name="{@name}">
                                                                                                        <xsl:value-of select="current()"/>
                                                                                                    </xsl:attribute>
                                                                                                </xsl:for-each>
                                                                                            </input>
                                                                                             
                                                                                            <label for="{@id}">
                                                                                                <xsl:value-of select="current()"/>
                                                                                            </label>  
                                                                                        </xsl:for-each>
                                                                                        <xsl:if test="FIELD">
                                                                                            <div>
                                                                                                <xsl:attribute name="id">
                                                                                                    <xsl:value-of select="@Backdivid"/>
                                                                                                </xsl:attribute>
                                                                                                <xsl:attribute name="class">
                                                                                                    <xsl:value-of select="@Backcontrols"/>
                                                                                                </xsl:attribute>
                                                                                                <xsl:for-each select="FIELD">
                                                                                                    <xsl:choose>
                                                                                                        <xsl:when test="@type='DropDownList'">
                                                                                                            <div>
                                                                                                                <xsl:value-of select="@label"/>
                                                                                                                <select>
                                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                        <xsl:attribute name="{@name}">
                                                                                                                            <xsl:value-of select="current()"/>
                                                                                                                        </xsl:attribute>
                                                                                                                    </xsl:for-each>
                                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                        <option>
                                                                                                                            <xsl:attribute name="value">
                                                                                                                                <xsl:value-of select="@value"/>
                                                                                                                            </xsl:attribute>
                                                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                                                <xsl:attribute name="selected">
                                                                                                                                    <xsl:text>selected</xsl:text>
                                                                                                                                </xsl:attribute>
                                                                                                                            </xsl:if>
                                                                                                                            <xsl:value-of select="@value"/>
                                                                                                                        </option>
                                                                                                                    </xsl:for-each>
                                                                                                                </select>
                                                                                                            </div>
                                                                                                        </xsl:when>
                                                                                    
                                                                                                        <xsl:when test="@type='TextBox'">
                                                                                                            <div>
                                                                                                                <xsl:value-of select="@label"/>
                                                                                                                <input type="text">
                                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                        <xsl:attribute name="{@name}">
                                                                                                                            <xsl:value-of select="current()"/>
                                                                                                                        </xsl:attribute>
                                                                                                                    </xsl:for-each>
                                                                                                                </input>
                                                                                                            </div>
                                                                                                        </xsl:when>
                                                                                    
                                                                                                        <xsl:when test="@type='RadioButtonList'">
                                                                                                            <div>
                                                                                                                <xsl:value-of select="@label"/>
                                                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                    <input type="radio">
                                                                                                                        <xsl:attribute name="value">
                                                                                                                            <xsl:value-of select="@value"/>
                                                                                                                        </xsl:attribute>
                                                                                                                        <xsl:attribute name="id">
                                                                                                                            <xsl:value-of select="@id"/>
                                                                                                                        </xsl:attribute>
                                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                                            <xsl:attribute name="checked">
                                                                                                                                <xsl:text>checked</xsl:text>
                                                                                                                            </xsl:attribute>
                                                                                                                        </xsl:if>
                                                                                                                        <xsl:attribute name="onclick">
                                                                                                                            <xsl:value-of select="@onclick"/>
                                                                                                                        </xsl:attribute>
                                                                                                                        <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                                            <xsl:attribute name="{@name}">
                                                                                                                                <xsl:value-of select="current()"/>
                                                                                                                            </xsl:attribute>
                                                                                                                        </xsl:for-each>
                                                                                                                    </input>
                                                                                                                     
                                                                                                                    <label for="{@id}">
                                                                                                                        <xsl:value-of select="current()"/>
                                                                                                                    </label>  
                                                                                                                </xsl:for-each>
                                                                                                            </div>
                                                                                                        </xsl:when>
                                                                                    
                                                                                                        <xsl:when test="@type='CheckBoxList'">
                                                                                                            <xsl:value-of select="@label"/>
                                                                                                            <div>
                                                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                    <input type="checkbox">
                                                                                                                        <xsl:attribute name="value">
                                                                                                                            <xsl:value-of select="@value"/>
                                                                                                                        </xsl:attribute>
                                                                                                                        <xsl:attribute name="id">
                                                                                                                            <xsl:value-of select="@id"/>
                                                                                                                        </xsl:attribute>
                                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                                            <xsl:attribute name="checked">
                                                                                                                                <xsl:text>checked</xsl:text>
                                                                                                                            </xsl:attribute>
                                                                                                                        </xsl:if>
                                                                                                                        <xsl:attribute name="onclick">
                                                                                                                            <xsl:value-of select="@onclick"/>
                                                                                                                        </xsl:attribute>
                                                                                                                        <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                                            <xsl:attribute name="{@name}">
                                                                                                                                <xsl:value-of select="current()"/>
                                                                                                                            </xsl:attribute>
                                                                                                                        </xsl:for-each>
                                                                                                                    </input>
                                                                                                                     
                                                                                                                    <label for="{@id}">
                                                                                                                        <xsl:value-of select="current()"/>
                                                                                                                    </label>  
                                                                                                                </xsl:for-each>
                                                                                                            </div>
                                                                                                        </xsl:when>
                                                                                                    </xsl:choose>
                                                                                                </xsl:for-each>
                                                                                            </div>
                                                                                        </xsl:if>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="line line-dashed b-b line-lg "/>
                                                                            </xsl:when>
                                                        
                                                                            <!-- Panel Bar Main TextBox -->
                                                                            <xsl:when test="@type='TextBox'">
                                                                                <div class="form-group">
                                                                                    <label class="col-sm-3 control-label">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <xsl:if test="@required='true'">
                                                                                            <span class="required"> *</span>
                                                                                        </xsl:if>
                                                                                    </label>
                                                                                    <div class="col-sm-4">
                                                                                        <input type="text">
                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                <xsl:attribute name="{@name}">
                                                                                                    <xsl:value-of select="current()"/>
                                                                                                </xsl:attribute>
                                                                                            </xsl:for-each>
                                                                                        </input>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="line line-dashed b-b line-lg "/>
                                                                            </xsl:when>
                                                        
                                                                            <!-- Panel Bar Main Textarea Full -->
                                                                            <xsl:when test="@type='textareaFull'">
                                                                                <div class="form-group">
                                                                                    <div class="col-sm-12">
                                                                                        <label>
                                                                                            <xsl:value-of select="@label"/>
                                                                                        </label>
                                                                                        <textarea>
                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                <xsl:attribute name="{@name}">
                                                                                                    <xsl:value-of select="current()"/>
                                                                                                </xsl:attribute>
                                                                                            </xsl:for-each>
                                                                                            <xsl:value-of select="VALUE"/>
                                                                                        </textarea>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="line line-dashed b-b line-lg "/>
                                                                            </xsl:when>
                                                        
                                                                            <!-- Panel Bar Main Checkbox -->
                                                                            <xsl:when test="@type='CheckBoxList'">
                                                                                <div class="form-group">
                                                                                    <label class="col-sm-3 control-label">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <xsl:if test="@required='true'">
                                                                                            <span class="required"> *</span>
                                                                                        </xsl:if>
                                                                                    </label>
                                                                                    <div class="col-sm-9">
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                            <div class='check_box_list'>
                                                                                                <input type="checkbox">
                                                                                                    <xsl:attribute name="value">
                                                                                                        <xsl:value-of select="@value"/>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:attribute name="id">
                                                                                                        <xsl:value-of select="@id"/>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                                        <xsl:attribute name="checked">
                                                                                                            <xsl:text>checked</xsl:text>
                                                                                                        </xsl:attribute>
                                                                                                    </xsl:if>
                                                                                                    <xsl:attribute name="onclick">
                                                                                                        <xsl:value-of select="@onclick"/>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                        <xsl:attribute name="{@name}">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:attribute>
                                                                                                    </xsl:for-each>
                                                                                                </input>
                                                                                                 
                                                                                                <label for="{@id}">
                                                                                                    <xsl:value-of select="current()"/>
                                                                                                </label>
                                                                                            </div>  
                                                                                        </xsl:for-each>
                                                                                        <xsl:if test="FIELD">
                                                                                            <div>
                                                                                                <xsl:attribute name="id">
                                                                                                    <xsl:value-of select="@Backdivid"/>
                                                                                                </xsl:attribute>
                                                                                                <xsl:attribute name="class">
                                                                                                    <xsl:value-of select="@Backcontrols"/>
                                                                                                </xsl:attribute>
                                                                                                <xsl:for-each select="FIELD">
                                                                                                    <xsl:choose>
                                                                                                        <xsl:when test="@type='TextBox'">
                                                                                                            <xsl:value-of select="@label"/>
                                                                                                            <input type="text">
                                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                    <xsl:attribute name="{@name}">
                                                                                                                        <xsl:value-of select="current()"/>
                                                                                                                    </xsl:attribute>
                                                                                                                </xsl:for-each>
                                                                                                            </input>
                                                                                                        </xsl:when>
                                                                                    
                                                                                                        <xsl:when test="@type='RadioButtonList'">
                                                                                                            <xsl:value-of select="@label"/>  
                                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                <input type="radio">
                                                                                                                    <xsl:attribute name="value">
                                                                                                                        <xsl:value-of select="@value"/>
                                                                                                                    </xsl:attribute>
                                                                                                                    <xsl:attribute name="id">
                                                                                                                        <xsl:value-of select="@id"/>
                                                                                                                    </xsl:attribute>
                                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                                                        <xsl:attribute name="checked">
                                                                                                                            <xsl:text>checked</xsl:text>
                                                                                                                        </xsl:attribute>
                                                                                                                    </xsl:if>
                                                                                                                    <xsl:attribute name="onclick">
                                                                                                                        <xsl:value-of select="@onclick"/>
                                                                                                                    </xsl:attribute>
                                                                                                                    <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                                        <xsl:attribute name="{@name}">
                                                                                                                            <xsl:value-of select="current()"/>
                                                                                                                        </xsl:attribute>
                                                                                                                    </xsl:for-each>
                                                                                                                </input>
                                                                                                                 
                                                                                                                <label for="{@id}">
                                                                                                                    <xsl:value-of select="current()"/>
                                                                                                                </label>  
                                                                                                            </xsl:for-each>
                                                                                                        </xsl:when>
                                                                                                    </xsl:choose>
                                                                                                </xsl:for-each>
                                                                                            </div>
                                                                                        </xsl:if>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="line line-dashed b-b line-lg "/>
                                                                            </xsl:when>
                                                        
                                                                            <!-- Panel Bar Main DropDown -->
                                                                            <xsl:when test="@type='DropDownList'">
                                                                                <div class="form-group">
                                                                                    <label class="col-sm-3 control-label">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <xsl:if test="@required='true'">
                                                                                            <span class="required"> *</span>
                                                                                        </xsl:if>
                                                                                    </label>
                                                                                    <div class="col-sm-9">
                                                                                        <div class="row">
                                                                                            <div class="col-sm-3">
                                                                                                <select>
                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                        <xsl:attribute name="{@name}">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:attribute>
                                                                                                    </xsl:for-each>
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                        <option>
                                                                                                            <xsl:attribute name="value">
                                                                                                                <xsl:value-of select="@value"/>
                                                                                                            </xsl:attribute>
                                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                                <xsl:attribute name="selected">
                                                                                                                    <xsl:text>selected</xsl:text>
                                                                                                                </xsl:attribute>
                                                                                                            </xsl:if>
                                                                                                            <xsl:value-of select="@value"/>
                                                                                                        </option>
                                                                                                    </xsl:for-each>
                                                                                                </select>
                                                                                            </div>
                                                                                            <div class="col-sm-6">
                                                                                                <xsl:value-of select="@Backtext"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="line line-dashed b-b line-lg "/>
                                                                            </xsl:when>
                                                        
                                                                            <!-- Panel Bar Main Text Box With DropDownList-->
                                                                            <xsl:when test="@type='TextBoxDDL'">
                                                                                <div class="form-group">
                                                                                    <label class="col-sm-3 control-label">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <xsl:if test="@required='true'">
                                                                                            <span class="required"> *</span>
                                                                                        </xsl:if>
                                                                                    </label>
                                                                                    <div class="col-sm-9">
                                                                                        <div class="row">
                                                                                            <div class="col-sm-6">
                                                                                                <input type="text">
                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                        <xsl:attribute name="{@name}">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:attribute>
                                                                                                    </xsl:for-each>
                                                                                                </input>
                                                                                            </div>
                                                                                            <div class="col-sm-6">
                                                                                                <select>
                                                                                                    <xsl:for-each select="FIELD/PROPERTIES/PROPERTY">
                                                                                                        <xsl:attribute name="{@name}">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:attribute>
                                                                                                    </xsl:for-each>
                                                                                                    <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                                        <option>
                                                                                                            <xsl:attribute name="value">
                                                                                                                <xsl:value-of select="@value"/>
                                                                                                            </xsl:attribute>
                                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                                <xsl:attribute name="selected">
                                                                                                                    <xsl:text>selected</xsl:text>
                                                                                                                </xsl:attribute>
                                                                                                            </xsl:if>
                                                                                                            <xsl:value-of select="@value"/>
                                                                                                        </option>
                                                                                                    </xsl:for-each>
                                                                                                </select>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                            
                                                                                <div class="line line-dashed b-b line-lg "/>
                                                                            </xsl:when>
                                                                            
                                                                            <xsl:when test="@type='TextBoxDDLlabel'">
                                                                                <div class="form-group">
                                                                                    <label class="col-sm-3 control-label">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <xsl:if test="@required='true'">
                                                                                            <span class="required"> *</span>
                                                                                        </xsl:if>
                                                                                    </label>
                                                                                    <div class="col-sm-9">
                                                                                        <div class="row">
                                                                                            <div class="col-sm-6">
                                                                                                <input type="text">
                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                        <xsl:attribute name="{@name}">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:attribute>
                                                                                                    </xsl:for-each>
                                                                                                </input>
                                                                                            </div>
                                                                                            <div class="col-sm-6">
                                                                                                <xsl:value-of select="@Backtext"/>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                            
                                                                                <div class="line line-dashed b-b line-lg "/>
                                                                            </xsl:when>
                                                                            
                                                                            <!-- Panel Bar Main Text Area-->
                                                                            <xsl:when test="@type='TextArea'">
                                                                                <div class="form-group">
                                                                                    <label class="col-sm-3 control-label">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <xsl:if test="@required='true'">
                                                                                            <span class="required"> *</span>
                                                                                        </xsl:if>
                                                                                    </label>
                                                                                    <div class="col-sm-9">
                                                                                        <textarea>
                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                <xsl:attribute name="{@name}">
                                                                                                    <xsl:value-of select="current()"/>
                                                                                                </xsl:attribute>
                                                                                            </xsl:for-each>
                                                                                            <xsl:value-of select="VALUE"/>
                                                                                        </textarea>
                                                                                    </div>
                                                                                </div>
                                                                                <div class="line line-dashed b-b line-lg "/>
                                                                            </xsl:when>
                                                                        </xsl:choose>
                                                                    </xsl:for-each>
                                                                </div>
                                                            </div>
                                                        </xsl:when>
                                                        
                                                        <xsl:when test="@type='Header2'">
                                                            <div class="col-sm-12">
                                                                <h2>
                                                                    <span class="label bg-dark"> 
                                                                        <xsl:value-of select="@label"/> 
                                                                    </span>
                                                                </h2>
                                                            </div>
                                                        </xsl:when>
                                                        
                                                        <!-- Panel Bar Main Grid -->
                                                        <xsl:when test="@type='RadGrid'">
                                                            <div class="form-group">
                                                                <div class="col-sm-12">
                                                                    <div class="form-group">
                                                                        <table>
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:attribute name="{@name}">
                                                                                    <xsl:value-of select="current()"/>
                                                                                </xsl:attribute>
                                                                            </xsl:for-each>
                                                                            <thead>
                                                                                <tr>
                                                                                    <xsl:for-each select="HEADER/TH">
                                                                                        <th>
                                                                                            <xsl:value-of select="current()"/>
                                                                                        </th>
                                                                                    </xsl:for-each>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <xsl:for-each select="COLUMNS">
                                                                                    <tr>
                                                                                        <xsl:for-each select="FIELD">
                                                                                            <td>
                                                                                                <xsl:choose>
                                                                                                    <xsl:when test="@type='TextBox'">
                                                                                                        <input type="text">
                                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                <xsl:attribute name="{@name}">
                                                                                                                    <xsl:value-of select="current()"/>
                                                                                                                </xsl:attribute>
                                                                                                            </xsl:for-each>
                                                                                                        </input>
                                                                                                    </xsl:when>
                                                                                                
                                                                                                    <!--Panel Bar Grid Main Text Box With DropDownList-->
                                                                                                    <xsl:when test="@type='TextBoxDDL'">
                                                                                                        <div class="row">
                                                                                                            <div class="col-sm-6">
                                                                                                                <input type="text">
                                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                        <xsl:attribute name="{@name}">
                                                                                                                            <xsl:value-of select="current()"/>
                                                                                                                        </xsl:attribute>
                                                                                                                    </xsl:for-each>
                                                                                                                </input>
                                                                                                            </div>
                                                                                                            <div class="col-sm-6">
                                                                                                                <select>
                                                                                                                    <xsl:for-each select="FIELD/PROPERTIES/PROPERTY">
                                                                                                                        <xsl:attribute name="{@name}">
                                                                                                                            <xsl:value-of select="current()"/>
                                                                                                                        </xsl:attribute>
                                                                                                                    </xsl:for-each>
                                                                                                                    <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                                                        <option>
                                                                                                                            <xsl:attribute name="value">
                                                                                                                                <xsl:value-of select="@value"/>
                                                                                                                            </xsl:attribute>
                                                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                                                <xsl:attribute name="selected">
                                                                                                                                    <xsl:text>selected</xsl:text>
                                                                                                                                </xsl:attribute>
                                                                                                                            </xsl:if>
                                                                                                                            <xsl:value-of select="@value"/>
                                                                                                                        </option>
                                                                                                                    </xsl:for-each>
                                                                                                                </select>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </xsl:when>
                                                                    
                                                                                                    <xsl:when test="@type='DropDownList'">
                                                                                                        <select>
                                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                <xsl:attribute name="{@name}">
                                                                                                                    <xsl:value-of select="current()"/>
                                                                                                                </xsl:attribute>
                                                                                                            </xsl:for-each>
                                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                <option>
                                                                                                                    <xsl:attribute name="value">
                                                                                                                        <xsl:value-of select="@value"/>
                                                                                                                    </xsl:attribute>
                                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                                                        <xsl:attribute name="selected">
                                                                                                                            <xsl:text>selected</xsl:text>
                                                                                                                        </xsl:attribute>
                                                                                                                    </xsl:if>
                                                                                                                    <xsl:value-of select="@value"/>
                                                                                                                </option>
                                                                                                            </xsl:for-each>
                                                                                                        </select>
                                                                                                    </xsl:when>
                                                                    
                                                                                                    <xsl:when test="@type='RadioButtonList'">
                                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                            <input type="radio">
                                                                                                                <xsl:attribute name="value">
                                                                                                                    <xsl:value-of select="@value"/>
                                                                                                                </xsl:attribute>
                                                                                                                <xsl:attribute name="id">
                                                                                                                    <xsl:value-of select="@id"/>
                                                                                                                </xsl:attribute>
                                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                                    <xsl:attribute name="checked">
                                                                                                                        <xsl:text>checked</xsl:text>
                                                                                                                    </xsl:attribute>
                                                                                                                </xsl:if>
                                                                                                                <xsl:attribute name="onclick">
                                                                                                                    <xsl:value-of select="@onclick"/>
                                                                                                                </xsl:attribute>
                                                                                                                <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                                    <xsl:attribute name="{@name}">
                                                                                                                        <xsl:value-of select="current()"/>
                                                                                                                    </xsl:attribute>
                                                                                                                </xsl:for-each>
                                                                                                            </input>
                                                                                                             
                                                                                                            <label for="{@id}">
                                                                                                                <xsl:value-of select="current()"/>
                                                                                                            </label>  
                                                                                                        </xsl:for-each>
                                                                                                        <xsl:if test="FIELD">
                                                                                                            <div>
                                                                                                                <xsl:attribute name="id">
                                                                                                                    <xsl:value-of select="@Backdivid"/>
                                                                                                                </xsl:attribute>
                                                                                                                <xsl:attribute name="class">
                                                                                                                    <xsl:value-of select="@Backcontrols"/>
                                                                                                                </xsl:attribute>
                                                                                                                <xsl:for-each select="FIELD">
                                                                                                                    <xsl:choose>
                                                                                                                        <xsl:when test="@type='TextBox'">
                                                                                                                            <xsl:value-of select="@label"/>
                                                                                                                            <input type="text">
                                                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                                    <xsl:attribute name="{@name}">
                                                                                                                                        <xsl:value-of select="current()"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                </xsl:for-each>
                                                                                                                            </input>
                                                                                                                        </xsl:when>
                                                                                                                        
                                                                                                                        <xsl:when test="@type='DropDownList'">
                                                                                                                            <select>
                                                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                                    <xsl:attribute name="{@name}">
                                                                                                                                        <xsl:value-of select="current()"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                </xsl:for-each>
                                                                                                                                
                                                                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                                    <option>
                                                                                                                                        <xsl:attribute name="value">
                                                                                                                                            <xsl:value-of select="@value"/>
                                                                                                                                        </xsl:attribute>
                                                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                                                            <xsl:attribute name="selected">
                                                                                                                                                <xsl:text>selected</xsl:text>
                                                                                                                                            </xsl:attribute>
                                                                                                                                        </xsl:if>
                                                                                                                                        <xsl:value-of select="@value"/>
                                                                                                                                    </option>
                                                                                                                                </xsl:for-each>
                                                                                                                            </select>
                                                                                                                        </xsl:when>
                                                                                                                        
                                                                                                                        <xsl:when test="@type='MultiDropDownList'">
                                                                                                                            <select multiple='true'>
                                                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                                    <xsl:attribute name="{@name}">
                                                                                                                                        <xsl:value-of select="current()"/>
                                                                                                                                    </xsl:attribute>
                                                                                                                                </xsl:for-each>
                                                                                                                                
                                                                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                                    <option>
                                                                                                                                        <xsl:attribute name="value">
                                                                                                                                            <xsl:value-of select="@value"/>
                                                                                                                                        </xsl:attribute>
                                                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                                                            <xsl:attribute name="selected">
                                                                                                                                                <xsl:text>selected</xsl:text>
                                                                                                                                            </xsl:attribute>
                                                                                                                                        </xsl:if>
                                                                                                                                        <xsl:value-of select="@value"/>
                                                                                                                                    </option>
                                                                                                                                </xsl:for-each>
                                                                                                                            </select>
                                                                                                                        </xsl:when>
                                                                                                                    </xsl:choose>
                                                                                                                </xsl:for-each>
                                                                                                            </div>
                                                                                                        </xsl:if>
                                                                                                    </xsl:when>
                                                                                                
                                                                                                    <xsl:when test="@type='CheckBoxList'">
                                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                            <input type="checkbox">
                                                                                                                <xsl:attribute name="value">
                                                                                                                    <xsl:value-of select="@value"/>
                                                                                                                </xsl:attribute>
                                                                                                                <xsl:attribute name="id">
                                                                                                                    <xsl:value-of select="@id"/>
                                                                                                                </xsl:attribute>
                                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                                    <xsl:attribute name="checked">
                                                                                                                        <xsl:text>checked</xsl:text>
                                                                                                                    </xsl:attribute>
                                                                                                                </xsl:if>
                                                                                                                <xsl:attribute name="onclick">
                                                                                                                    <xsl:value-of select="@onclick"/>
                                                                                                                </xsl:attribute>
                                                                                                                <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                                    <xsl:attribute name="{@name}">
                                                                                                                        <xsl:value-of select="current()"/>
                                                                                                                    </xsl:attribute>
                                                                                                                </xsl:for-each>
                                                                                                            </input>
                                                                                                             
                                                                                                            <label for="{@id}">
                                                                                                                <xsl:value-of select="current()"/>
                                                                                                            </label>  
                                                                                                        </xsl:for-each>
                                                                                                    </xsl:when>
                                                                                                </xsl:choose>
                                                                                            </td>
                                                                                        </xsl:for-each>
                                                                                    </tr>
                                                                                </xsl:for-each>
                                                                            </tbody>
                                                                        </table>
                                                                    </div>
                                                                    
                                                                    <xsl:if test="@ADDButton='True'">
                                                                        <input type="button">
                                                                            <xsl:attribute name="class">
                                                                                <xsl:text>addMore btn btn-info pull-right</xsl:text>
                                                                            </xsl:attribute>
                                                                            <xsl:attribute name="value">
                                                                                <xsl:text>Add</xsl:text>
                                                                            </xsl:attribute>
                                                                            <xsl:attribute name="id">
                                                                                <xsl:value-of select="@ADDButtonID"/>
                                                                            </xsl:attribute>
                                                                            <xsl:attribute name="data-table-id">
                                                                                <xsl:value-of select="@AddButtonTableId"/>
                                                                            </xsl:attribute>
                                                                        </input>
                                                                    </xsl:if>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:when>
                                                        
                                                        <!-- Panel Bar Main Radio Button -->
                                                        <xsl:when test="@type='RadioButtonList'">
                                                            <div class="form-group">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                    <xsl:if test="@required='true'">
                                                                        <span class="required"> *</span>
                                                                    </xsl:if>
                                                                    <a title="clear" class="panelbar_clear pull-right" data-divid="{@id}">
                                                                        <i class="fa fa-trash"/>
                                                                    </a>
                                                                </label>  
                                                                <div class="col-sm-8">
                                                                    <xsl:attribute name="id">
                                                                        <xsl:value-of select="@id"/>
                                                                    </xsl:attribute>
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <input type="radio">
                                                                            <xsl:attribute name="value">
                                                                                <xsl:value-of select="@value"/>
                                                                            </xsl:attribute>
                                                                            <xsl:attribute name="id">
                                                                                <xsl:value-of select="@id"/>
                                                                            </xsl:attribute>
                                                                            <xsl:if test="@Selected = 'true'">
                                                                                <xsl:attribute name="checked">
                                                                                    <xsl:text>checked</xsl:text>
                                                                                </xsl:attribute>
                                                                            </xsl:if>
                                                                            <xsl:attribute name="onclick">
                                                                                <xsl:value-of select="@onclick"/>
                                                                            </xsl:attribute>
                                                                            <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                <xsl:attribute name="{@name}">
                                                                                    <xsl:value-of select="current()"/>
                                                                                </xsl:attribute>
                                                                            </xsl:for-each>
                                                                        </input>
                                                                         
                                                                        <label for="{@id}">
                                                                            <xsl:value-of select="current()"/>
                                                                        </label>  
                                                                    </xsl:for-each>
                                                                    <xsl:if test="FIELD">
                                                                        <div>
                                                                            <xsl:attribute name="id">
                                                                                <xsl:value-of select="@Backdivid"/>
                                                                            </xsl:attribute>
                                                                            <xsl:attribute name="class">
                                                                                <xsl:value-of select="@Backcontrols"/>
                                                                            </xsl:attribute>
                                                                            <xsl:for-each select="FIELD">
                                                                                <xsl:choose>
                                                                                    <xsl:when test="@type='DropDownList'">
                                                                                        <div>
                                                                                            <xsl:value-of select="@label"/>
                                                                                            <select style="width:auto;">
                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                    <xsl:attribute name="{@name}">
                                                                                                        <xsl:value-of select="current()"/>
                                                                                                    </xsl:attribute>
                                                                                                </xsl:for-each>
                                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                    <option>
                                                                                                        <xsl:attribute name="value">
                                                                                                            <xsl:value-of select="@value"/>
                                                                                                        </xsl:attribute>
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                            <xsl:attribute name="selected">
                                                                                                                <xsl:text>selected</xsl:text>
                                                                                                            </xsl:attribute>
                                                                                                        </xsl:if>
                                                                                                        <xsl:value-of select="@value"/>
                                                                                                    </option>
                                                                                                </xsl:for-each>
                                                                                            </select>
                                                                                        </div>
                                                                                    </xsl:when>
                                                                                    
                                                                                    <xsl:when test="@type='TextBox'">
                                                                                        <div>
                                                                                            <xsl:value-of select="@label"/>
                                                                                            <input type="text">
                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                    <xsl:attribute name="{@name}">
                                                                                                        <xsl:value-of select="current()"/>
                                                                                                    </xsl:attribute>
                                                                                                </xsl:for-each>
                                                                                            </input>
                                                                                        </div>
                                                                                    </xsl:when>
                                                                                    
                                                                                    <xsl:when test="@type='RadioButtonList'">
                                                                                        <div>
                                                                                            <xsl:value-of select="@label"/>
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                <input type="radio">
                                                                                                    <xsl:attribute name="value">
                                                                                                        <xsl:value-of select="@value"/>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:attribute name="id">
                                                                                                        <xsl:value-of select="@id"/>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                                        <xsl:attribute name="checked">
                                                                                                            <xsl:text>checked</xsl:text>
                                                                                                        </xsl:attribute>
                                                                                                    </xsl:if>
                                                                                                    <xsl:attribute name="onclick">
                                                                                                        <xsl:value-of select="@onclick"/>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                        <xsl:attribute name="{@name}">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:attribute>
                                                                                                    </xsl:for-each>
                                                                                                </input>
                                                                                                 
                                                                                                <label for="{@id}">
                                                                                                    <xsl:value-of select="current()"/>
                                                                                                </label>  
                                                                                            </xsl:for-each>
                                                                                        </div>
                                                                                    </xsl:when>
                                                                                    
                                                                                    <xsl:when test="@type='CheckBoxList'">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <div>
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                <input type="checkbox">
                                                                                                    <xsl:attribute name="value">
                                                                                                        <xsl:value-of select="@value"/>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:attribute name="id">
                                                                                                        <xsl:value-of select="@id"/>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                                        <xsl:attribute name="checked">
                                                                                                            <xsl:text>checked</xsl:text>
                                                                                                        </xsl:attribute>
                                                                                                    </xsl:if>
                                                                                                    <xsl:attribute name="onclick">
                                                                                                        <xsl:value-of select="@onclick"/>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                        <xsl:attribute name="{@name}">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:attribute>
                                                                                                    </xsl:for-each>
                                                                                                </input>
                                                                                                 
                                                                                                <label for="{@id}">
                                                                                                    <xsl:value-of select="current()"/>
                                                                                                </label>  
                                                                                            </xsl:for-each>
                                                                                        </div>
                                                                                    </xsl:when>
                                                                                </xsl:choose>
                                                                            </xsl:for-each>
                                                                        </div>
                                                                    </xsl:if>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:when>
                                                        
                                                        <!-- Panel Bar Main TextBox -->
                                                        <xsl:when test="@type='TextBox'">
                                                            <div class="form-group">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                    <xsl:if test="@required='true'">
                                                                        <span class="required"> *</span>
                                                                    </xsl:if>
                                                                </label>
                                                                <div class="col-sm-4">
                                                                    <input type="text">
                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                            <xsl:attribute name="{@name}">
                                                                                <xsl:value-of select="current()"/>
                                                                            </xsl:attribute>
                                                                        </xsl:for-each>
                                                                    </input>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:when>
                                                        
                                                        <!-- Panel Bar Main Textarea Full -->
                                                        <xsl:when test="@type='textareaFull'">
                                                            <div class="form-group">
                                                                <div class="col-sm-12">
                                                                    <label>
                                                                        <xsl:value-of select="@label"/>
                                                                    </label>
                                                                    <textarea>
                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                            <xsl:attribute name="{@name}">
                                                                                <xsl:value-of select="current()"/>
                                                                            </xsl:attribute>
                                                                        </xsl:for-each>
                                                                        <xsl:value-of select="VALUE"/>
                                                                    </textarea>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:when>
                                                        
                                                        <!-- Panel Bar Main Checkbox -->
                                                        <xsl:when test="@type='CheckBoxList'">
                                                            <div class="form-group">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                    <xsl:if test="@required='true'">
                                                                        <span class="required"> *</span>
                                                                    </xsl:if>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <div class="check_box_list">
                                                                            <input type="checkbox">
                                                                                <xsl:attribute name="value">
                                                                                    <xsl:value-of select="@value"/>
                                                                                </xsl:attribute>
                                                                                <xsl:attribute name="id">
                                                                                    <xsl:value-of select="@id"/>
                                                                                </xsl:attribute>
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:attribute name="checked">
                                                                                        <xsl:text>checked</xsl:text>
                                                                                    </xsl:attribute>
                                                                                </xsl:if>
                                                                                <xsl:attribute name="onclick">
                                                                                    <xsl:value-of select="@onclick"/>
                                                                                </xsl:attribute>
                                                                                <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                    <xsl:attribute name="{@name}">
                                                                                        <xsl:value-of select="current()"/>
                                                                                    </xsl:attribute>
                                                                                </xsl:for-each>
                                                                            </input>
                                                                             
                                                                            <label for="{@id}">
                                                                                <xsl:value-of select="current()"/>
                                                                            </label>  
                                                                        </div>
                                                                    </xsl:for-each>
                                                                    <xsl:if test="FIELD">
                                                                        <div>
                                                                            <xsl:attribute name="id">
                                                                                <xsl:value-of select="@Backdivid"/>
                                                                            </xsl:attribute>
                                                                            <xsl:attribute name="class">
                                                                                <xsl:value-of select="@Backcontrols"/>
                                                                            </xsl:attribute>
                                                                            <xsl:for-each select="FIELD">
                                                                                <xsl:choose>
                                                                                    <xsl:when test="@type='TextBox'">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <input type="text">
                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                <xsl:attribute name="{@name}">
                                                                                                    <xsl:value-of select="current()"/>
                                                                                                </xsl:attribute>
                                                                                            </xsl:for-each>
                                                                                        </input>
                                                                                    </xsl:when>
                                                                                    
                                                                                    <xsl:when test="@type='RadioButtonList'">
                                                                                        <xsl:value-of select="@label"/>  
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                            <input type="radio">
                                                                                                <xsl:attribute name="value">
                                                                                                    <xsl:value-of select="@value"/>
                                                                                                </xsl:attribute>
                                                                                                <xsl:attribute name="id">
                                                                                                    <xsl:value-of select="@id"/>
                                                                                                </xsl:attribute>
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                    <xsl:attribute name="checked">
                                                                                                        <xsl:text>checked</xsl:text>
                                                                                                    </xsl:attribute>
                                                                                                </xsl:if>
                                                                                                <xsl:attribute name="onclick">
                                                                                                    <xsl:value-of select="@onclick"/>
                                                                                                </xsl:attribute>
                                                                                                <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                    <xsl:attribute name="{@name}">
                                                                                                        <xsl:value-of select="current()"/>
                                                                                                    </xsl:attribute>
                                                                                                </xsl:for-each>
                                                                                            </input>
                                                                                             
                                                                                            <label for="{@id}">
                                                                                                <xsl:value-of select="current()"/>
                                                                                            </label>  
                                                                                        </xsl:for-each>
                                                                                    </xsl:when>
                                                                                    
                                                                                    <xsl:when test="@type='CheckBoxList'">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <div>
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                <input type="checkbox">
                                                                                                    <xsl:attribute name="value">
                                                                                                        <xsl:value-of select="@value"/>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:attribute name="id">
                                                                                                        <xsl:value-of select="@id"/>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                                        <xsl:attribute name="checked">
                                                                                                            <xsl:text>checked</xsl:text>
                                                                                                        </xsl:attribute>
                                                                                                    </xsl:if>
                                                                                                    <xsl:attribute name="onclick">
                                                                                                        <xsl:value-of select="@onclick"/>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:for-each select="../../PROPERTIES/PROPERTY">
                                                                                                        <xsl:attribute name="{@name}">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:attribute>
                                                                                                    </xsl:for-each>
                                                                                                </input>
                                                                                                 
                                                                                                <label for="{@id}">
                                                                                                    <xsl:value-of select="current()"/>
                                                                                                </label>  
                                                                                            </xsl:for-each>
                                                                                        </div>
                                                                                    </xsl:when>
                                                                                </xsl:choose>
                                                                            </xsl:for-each>
                                                                        </div>
                                                                    </xsl:if>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:when>
                                                        
                                                        <!-- Panel Bar Main DropDown -->
                                                        <xsl:when test="@type='DropDownList'">
                                                            <div class="form-group">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                    <xsl:if test="@required='true'">
                                                                        <span class="required"> *</span>
                                                                    </xsl:if>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <select>
                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                            <xsl:attribute name="{@name}">
                                                                                <xsl:value-of select="current()"/>
                                                                            </xsl:attribute>
                                                                        </xsl:for-each>
                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                            <option>
                                                                                <xsl:attribute name="value">
                                                                                    <xsl:value-of select="@value"/>
                                                                                </xsl:attribute>
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                    <xsl:attribute name="selected">
                                                                                        <xsl:text>selected</xsl:text>
                                                                                    </xsl:attribute>
                                                                                </xsl:if>
                                                                                <xsl:value-of select="@value"/>
                                                                            </option>
                                                                        </xsl:for-each>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:when>
                                                        
                                                        <!-- Panel Bar Main Text Box With DropDownList-->
                                                        <xsl:when test="@type='TextBoxDDL'">
                                                            <div class="form-group">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                    <xsl:if test="@required='true'">
                                                                        <span class="required"> *</span>
                                                                    </xsl:if>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <div class="row">
                                                                        <div class="col-sm-6">
                                                                            <input type="text">
                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                    <xsl:attribute name="{@name}">
                                                                                        <xsl:value-of select="current()"/>
                                                                                    </xsl:attribute>
                                                                                </xsl:for-each>
                                                                            </input>
                                                                        </div>
                                                                        <div class="col-sm-6">
                                                                            <select>
                                                                                <xsl:for-each select="FIELD/PROPERTIES/PROPERTY">
                                                                                    <xsl:attribute name="{@name}">
                                                                                        <xsl:value-of select="current()"/>
                                                                                    </xsl:attribute>
                                                                                </xsl:for-each>
                                                                                <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                    <option>
                                                                                        <xsl:attribute name="value">
                                                                                            <xsl:value-of select="@value"/>
                                                                                        </xsl:attribute>
                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                            <xsl:attribute name="selected">
                                                                                                <xsl:text>selected</xsl:text>
                                                                                            </xsl:attribute>
                                                                                        </xsl:if>
                                                                                        <xsl:value-of select="@value"/>
                                                                                    </option>
                                                                                </xsl:for-each>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:when>
                                                        
                                                        <!-- Panel Bar Main Text Area-->
                                                        <xsl:when test="@type='TextArea'">
                                                            <div class="form-group">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                    <xsl:if test="@required='true'">
                                                                        <span class="required"> *</span>
                                                                    </xsl:if>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <textarea>
                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                            <xsl:attribute name="{@name}">
                                                                                <xsl:value-of select="current()"/>
                                                                            </xsl:attribute>
                                                                        </xsl:for-each>
                                                                        <xsl:value-of select="VALUE"/>
                                                                    </textarea>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:when> 
                                                    </xsl:choose>
                                                </xsl:for-each>
                                            </div>
                                        </div>
                                    </xsl:when>
                                    
                                </xsl:choose>
                            </xsl:for-each>
                        </div>
                    </xsl:for-each>
                </div>
            </xsl:for-each>
        </form>
    </xsl:template>
</xsl:stylesheet>

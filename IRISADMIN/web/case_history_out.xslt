<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html"/>
    <xsl:template match="/">
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
                                    <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                        <div class="form-group">
                                            <div class="col-sm-4 col-sm-offset-8">
                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                    <xsl:if test="@name='value'">
                                                        <xsl:value-of select="current()"/>
                                                        <xsl:value-of select="../../@Backtext"/>
                                                    </xsl:if>
                                                </xsl:for-each>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:if>
                                </xsl:when>
                                    
                                <!-- Main Header2 -->
                                <xsl:when test="@type='Header2'">
                                    <div class="col-sm-12 header2" data-header2="{@class}">
                                        <h2>
                                            <span class="label bg-dark"> 
                                                <xsl:value-of select="@label"/> 
                                            </span>
                                        </h2>
                                    </div>
                                </xsl:when>
                                
                                <!-- Main Text Box With DropDownList-->
                                <xsl:when test="@type='TextBoxDDL'">
                                    <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                        <div class="form-group {@header2Class}">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                            </label>
                                            <div class="col-sm-9">
                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                    <xsl:if test="@name='value'">
                                                        <xsl:value-of select="current()"/>
                                                    </xsl:if>
                                                </xsl:for-each>
                                                 
                                                <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                    <xsl:if test="@Selected = 'true'">
                                                         
                                                        <xsl:value-of select="@value"/>
                                                    </xsl:if>
                                                </xsl:for-each>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:if>
                                </xsl:when>
                                
                                <!-- Main DropDownList-->
                                <xsl:when test="@type='DropDownList'">
                                    <div class="form-group {@header2Class}">
                                        <label class="col-sm-3 control-label">
                                            <xsl:value-of select="@label"/>
                                        </label>
                                        <div class="col-sm-9">
                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                <xsl:if test="@Selected = 'true'">
                                                    <xsl:value-of select="@value"/>
                                                </xsl:if>
                                            </xsl:for-each>
                                        </div>
                                    </div>
                                    <div class="line line-dashed b-b line-lg "/>
                                </xsl:when>
                                    
                                <!-- Main Text Box -->
                                <xsl:when test="@type='TextBox'">
                                    <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                        <div class="form-group {@header2Class}">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                            </label>
                                            <div class="col-sm-9">
                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                    <xsl:if test="@name='value'">
                                                        <xsl:value-of select="current()"/>
                                                        <xsl:value-of select="../../@Backtext"/>
                                                    </xsl:if>
                                                </xsl:for-each>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:if>
                                </xsl:when> 
                                    
                                <!-- Main Text Area-->
                                <xsl:when test="@type='TextArea'">
                                    <xsl:if test="VALUE and VALUE!=''">
                                        <div class="form-group {@header2Class}">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                            </label>
                                            <div class="col-sm-9">
                                                <xsl:call-template name="LFsToBRs">
                                                    <xsl:with-param name="input" select="VALUE"/>
                                                </xsl:call-template>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:if>
                                </xsl:when>
                                    
                                <!-- Main Textarea Full -->
                                <xsl:when test="@type='textareaFull'">
                                    <xsl:if test="VALUE and VALUE!=''">
                                        <div class="form-group {@header2Class}">
                                            <div class="col-sm-12">
                                                <!--                                                <label>
                                                    <xsl:value-of select="@label"/>
                                                </label> -->
                                                <div id="{@id}">
                                                    <xsl:attribute name="class">
                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                            <xsl:if test="@name='class'">
                                                                <xsl:value-of select="current()"/>
                                                            </xsl:if>
                                                        </xsl:for-each>
                                                    </xsl:attribute>
                                                    <!--<xsl:value-of select="VALUE" disable-output-escaping="yes"></xsl:value-of>-->
                                                    <xsl:value-of select="VALUE"/>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:if>
                                </xsl:when>  
                                    
                                <!-- Main Radio Button -->                          
                                <xsl:when test="@type='RadioButtonList'">
                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                        <div class="form-group {@header2Class}">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                            </label>
                                            <div class="col-sm-9">
                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                    <xsl:if test="@Selected = 'true'">
                                                        <xsl:value-of select="current()"/>
                                                    </xsl:if>
                                                </xsl:for-each>
                                                <xsl:if test="FIELD">
                                                    <span>
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
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <span id="sub_textbox">
                                                                                <xsl:value-of select="current()"/>
                                                                            </span>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </xsl:when>
                                                            
                                                                <xsl:when test="@type='RadioButtonList'">
                                                                    <xsl:value-of select="@label"/> 
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                            <span id="sub_textbox">
                                                                                <xsl:value-of select="current()"/>
                                                                            </span>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </xsl:when>
                                                            
                                                                <xsl:when test="@type='DropDownList'">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                            <xsl:value-of select="../../@label"/>
                                                                                <xsl:value-of select="@value"/>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </span>
                                                    
                                                </xsl:if>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:if>
                                </xsl:when>
                                
                                <!-- Main Checkbox -->
                                <xsl:when test="@type='CheckBoxList'">
                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                        <div class="form-group {@header2Class}">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                            </label>
                                            <div class="col-sm-9">
                                                <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                    <xsl:if test="@Selected = 'true'">
                                                        <xsl:value-of select="concat(' ' , @value)"/>
                                                        <xsl:if test="not(position() = last())">,</xsl:if>
                                                    </xsl:if>
                                                </xsl:for-each>
                                                <xsl:if test="FIELD">
                                                    <span>
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
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <span id="sub_textbox">
                                                                                <xsl:value-of select="current()"/>
                                                                            </span>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </xsl:when>
                                                            </xsl:choose>
                                                        </xsl:for-each>
                                                    </span>
                                                </xsl:if>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:if>
                                </xsl:when>
                                
                                <xsl:when test="@type='MultiDropDownList'">
                                    <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                        <div class="form-group {@header2Class}">
                                            <label class="col-sm-3 control-label">
                                                <xsl:value-of select="@label"/>
                                            </label>
                                            <div class="col-sm-9">
                                                <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                    <xsl:if test="@Selected = 'true'">
                                                        <xsl:value-of select="concat(' ' , @value)"/>
                                                        <xsl:if test="not(position() = last())">,</xsl:if>
                                                    </xsl:if>
                                                </xsl:for-each>
                                            </div>
                                        </div>
                                        <div class="line line-dashed b-b line-lg "/>
                                    </xsl:if>
                                </xsl:when>
                                
                                <!-- Main Grid -->
                                <xsl:when test="@type='RadGrid'">
                                    <div class="form-group RadGrid {@header2Class}" data-radgrid="{@AddButtonTableId}">
                                        <div class="col-sm-12">
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
                                                                        <!-- Text Box -->
                                                                        <xsl:when test="@type='TextBox'">
                                                                            <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                    <xsl:if test="@name='value'">
                                                                                        <xsl:value-of select="current()"/>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:if>
                                                                        </xsl:when>
                                                                        
                                                                        <!-- Main Text Box With DropDownList-->
                                                                        <xsl:when test="@type='TextBoxDDL'">
                                                                            <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                    <xsl:if test="@name='value'">
                                                                                        <xsl:value-of select="current()"/>
                                                                                    </xsl:if>
                                                                                    <xsl:value-of select="@Backtext"/>
                                                                                </xsl:for-each>
                                                                                 
                                                                                <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                         
                                                                                        <xsl:value-of select="@value"/>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:if>
                                                                        </xsl:when>
                                                                        
                                                                        <!-- Drop Down List -->
                                                                        <xsl:when test="@type='DropDownList'">
                                                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                         
                                                                                        <xsl:value-of select="@value"/>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:if>
                                                                        </xsl:when>
                                                                    
                                                                        <!-- Radio Button -->
                                                                        <xsl:when test="@type='RadioButtonList'">
                                                                            <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                 
                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                        <xsl:value-of select="current()"/>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                                <xsl:if test="FIELD">
                                                                                    <span>
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
                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                        <xsl:if test="@name='value'">
                                                                                                            <span id="sub_textbox">
                                                                                                                <xsl:value-of select="current()"/>
                                                                                                            </span>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
                                                                                                </xsl:when>
                                                                                            </xsl:choose>
                                                                                        </xsl:for-each>
                                                                                    </span>
                                                                                </xsl:if>
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
                                    </div>
                                    <div class="line line-dashed b-b line-lg "/>
                                </xsl:when>
                                    
                                <!-- Main Panel Bar -->
                                <xsl:when test="@type='PanelBar'">
                                    <div class="panel panel-default">
                                        <div class="panel-heading">
                                            <h4 class="panel-title">
                                                <!--<a class="accordion-toggle" data-toggle="collapse" data-target="#{@target_div}" href="javascript:void(0)">-->
                                                <a class="accordion-toggle" href="javascript:void(0)">
                                                    <span>
                                                        <xsl:value-of select="@label"/>
                                                    </span>
                                                </a>
                                            </h4>
                                        </div>
                                        <div id="{@target_div}" class="panel-body">
                                            <xsl:for-each select="FIELD">
                                                <xsl:choose>
                                                    <!-- Main Header2 -->
                                                    <xsl:when test="@type='Header2'">
                                                        <div class="col-sm-12 header2" data-header2="{@class}">
                                                            <h2>
                                                                <span class="label bg-dark"> 
                                                                    <xsl:value-of select="@label"/> 
                                                                </span>
                                                            </h2>
                                                        </div>
                                                    </xsl:when>
                                                    
                                                    <xsl:when test="@type='RadGrid'">
                                                        <div class="form-group RadGrid {@header2Class}" data-radgrid="{@AddButtonTableId}">
                                                            <div class="col-sm-12">
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
                                                                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                        <xsl:if test="@name='value'">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                                            
                                                                                            <!-- Main Text Box With DropDownList-->
                                                                                            <xsl:when test="@type='TextBoxDDL'">
                                                                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                        <xsl:if test="@name='value'">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:if>
                                                                                                        <xsl:value-of select="@Backtext"/>
                                                                                                    </xsl:for-each>
                                                                                                     
                                                                                                    <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                             
                                                                                                            <xsl:value-of select="@value"/>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                    
                                                                                            <xsl:when test="@type='DropDownList'">
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                             
                                                                                                            <xsl:value-of select="@value"/>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                    
                                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:if>
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
                                                                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                            <xsl:if test="@name='value'">
                                                                                                                                <xsl:value-of select="current()"/>
                                                                                                                            </xsl:if>
                                                                                                                        </xsl:for-each>
                                                                                                                    </xsl:when>
                                                                                                                    
                                                                                                                    <xsl:when test="@type='DropDownList'">
                                                                                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                                                     
                                                                                                                                    <xsl:value-of select="@value"/>
                                                                                                                                </xsl:if>
                                                                                                                            </xsl:for-each>
                                                                                                                        </xsl:if>
                                                                                                                    </xsl:when>
                                                                                                                </xsl:choose>
                                                                                                            </xsl:for-each>
                                                                                                        </div>
                                                                                                    </xsl:if>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                                                
                                                                                            <xsl:when test="@type='CheckBoxList'">
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                            <xsl:value-of select="concat(' ' , @value)"/>
                                                                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
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
                                                        </div>
                                                    </xsl:when>
                                                        
                                                    <xsl:when test="@type='RadioButtonList'">
                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                            <div class="form-group {@header2Class}">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                </label> 
                                                                <div class="col-sm-9">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                            <xsl:value-of select="current()"/>
                                                                        </xsl:if>
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
                                                                                        <span>
                                                                                            <xsl:value-of select="@label"/> 
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                    <span id="sub_textbox">
                                                                                                        <xsl:value-of select="@value"/>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
                                                                                        </span>
                                                                                    </xsl:when>
                                                                                    
                                                                                    <xsl:when test="@type='TextBox'">
                                                                                        <span>
                                                                                            <xsl:value-of select="@label"/> 
                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                <xsl:if test="@name='value'">
                                                                                                    <span id="sub_textbox">
                                                                                                        <xsl:value-of select="current()"/>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
                                                                                        </span>
                                                                                    </xsl:when>
                                                                                    
                                                                                    <xsl:when test="@type='RadioButtonList'">
                                                                                        <span>
                                                                                            <xsl:value-of select="@label"/>
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                    <span id="sub_textbox">
                                                                                                        <xsl:value-of select="current()"/>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
                                                                                        </span>
                                                                                    </xsl:when>
                                                                                    
                                                                                    <xsl:when test="@type='CheckBoxList'">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <span>
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                    <span id="sub_textbox">
                                                                                                        <xsl:value-of select="concat(' ' , @value)"/>
                                                                                                        <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
                                                                                        </span>
                                                                                    </xsl:when>
                                                                                </xsl:choose>
                                                                            </xsl:for-each>
                                                                        </div>
                                                                    </xsl:if>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                    
                                                    <xsl:when test="@type='TextBoxDDL'">
                                                        <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                            <div class="form-group {@header2Class}">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <xsl:value-of select="current()"/>
                                                                        </xsl:if>
                                                                        <xsl:value-of select="@Backtext"/>
                                                                    </xsl:for-each>
                                                                     
                                                                    <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                             
                                                                            <xsl:value-of select="@value"/>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                        
                                                    <xsl:when test="@type='TextBox'">
                                                        <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                            <div class="form-group {@header2Class}">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <xsl:value-of select="current()"/>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                    
                                                    <!-- Main Text Area-->
                                                    <xsl:when test="@type='TextArea'">
                                                        <xsl:if test="VALUE and VALUE!=''">
                                                            <div class="form-group {@header2Class}">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <xsl:call-template name="LFsToBRs">
                                                                        <xsl:with-param name="input" select="VALUE"/>
                                                                    </xsl:call-template>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                        
                                                    <xsl:when test="@type='textareaFull'">
                                                        <xsl:if test="VALUE and VALUE!=''">
                                                            <div class="form-group {@header2Class}">
                                                                <div class="col-sm-12">
                                                                    <label>
                                                                        <xsl:value-of select="@label"/>
                                                                    </label> 
                                                                    <div id="{@id}">
                                                                        <xsl:attribute name="class">
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='class'">
                                                                                    <xsl:value-of select="current()"/>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:attribute>
                                                                        <xsl:value-of select="VALUE"/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                        
                                                    <xsl:when test="@type='CheckBoxList'">
                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                            <div class="form-group {@header2Class}">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                    <xsl:if test="@required='true'">
                                                                        <span class="required"> *</span>
                                                                    </xsl:if>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                            <xsl:value-of select="concat(' ' , @value)"/>
                                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                                        </xsl:if>
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
                                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                            <xsl:if test="@name='value'">
                                                                                                <xsl:value-of select="current()"/>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                    </xsl:when>
                                                                                
                                                                                    <xsl:when test="@type='RadioButtonList'">
                                                                                        <xsl:value-of select="@label"/>  
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                <xsl:value-of select="current()"/>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                    </xsl:when>
                                                                                    
                                                                                    <xsl:when test="@type='CheckBoxList'">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                <xsl:value-of select="concat(' ' , @value)"/>
                                                                                                <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                    </xsl:when>
                                                                                    
                                                                                </xsl:choose>
                                                                            </xsl:for-each>
                                                                        </div>
                                                                    </xsl:if>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                        
                                                    <xsl:when test="@type='DropDownList'">
                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                            <div class="form-group {@header2Class}">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                             
                                                                            <xsl:value-of select="@value"/>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                    <xsl:value-of select="@Backtext"/>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                </xsl:choose>
                                            </xsl:for-each>
                                        </div>
                                        <div id="{@target_div}" class="panel-body">
                                            <xsl:for-each select="FIELD/FIELD[not(@id='checkGesturingposturing') and not(@id='txtGesturingposturing') and not(@id='memory_radio') and not(@id='memory_recent_radio') 
                                                            and not(@id='memory_remote_radio') and not(@id='judgement_radio') and not(@id='judgement_social_radio') and not(@id='judgement_test_radio')]">
                                                <xsl:choose>
                                                    <!-- Main Header2 -->
                                                    <xsl:when test="@type='Header2'">
                                                        <div class="col-sm-12 header2" data-header2="{@class}">
                                                            <h2>
                                                                <span class="label bg-dark"> 
                                                                    <xsl:value-of select="@label"/> 
                                                                </span>
                                                            </h2>
                                                        </div>
                                                    </xsl:when>
                                                    
                                                    <xsl:when test="@type='RadGrid'">
                                                        <div class="form-group RadGrid {@header2Class}" data-radgrid="{@AddButtonTableId}">
                                                            <div class="col-sm-12">
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
                                                                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                        <xsl:if test="@name='value'">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                                            
                                                                                            <!-- Main Text Box With DropDownList-->
                                                                                            <xsl:when test="@type='TextBoxDDL'">
                                                                                                <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                        <xsl:if test="@name='value'">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:if>
                                                                                                        <xsl:value-of select="@Backtext"/>
                                                                                                    </xsl:for-each>
                                                                                                     
                                                                                                    <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                             
                                                                                                            <xsl:value-of select="@value"/>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                    
                                                                                            <xsl:when test="@type='DropDownList'">
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                             
                                                                                                            <xsl:value-of select="@value"/>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                    
                                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:if>
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
                                                                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                            <xsl:if test="@name='value'">
                                                                                                                                <xsl:value-of select="current()"/>
                                                                                                                            </xsl:if>
                                                                                                                        </xsl:for-each>
                                                                                                                    </xsl:when>
                                                                                                                    
                                                                                                                    <xsl:when test="@type='DropDownList'">
                                                                                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                                                     
                                                                                                                                    <xsl:value-of select="@value"/>
                                                                                                                                </xsl:if>
                                                                                                                            </xsl:for-each>
                                                                                                                        </xsl:if>
                                                                                                                    </xsl:when>
                                                                                                                </xsl:choose>
                                                                                                            </xsl:for-each>
                                                                                                        </div>
                                                                                                    </xsl:if>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                                            
                                                                                            <xsl:when test="@type='DropDowntextbox'">
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                            <xsl:value-of select="current()"/>
                                                                                                        </xsl:if>
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
                                                                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                            <xsl:if test="@name='value'">
                                                                                                                                <xsl:value-of select="current()"/>
                                                                                                                            </xsl:if>
                                                                                                                        </xsl:for-each>
                                                                                                                    </xsl:when>
                                                                                                                    
                                                                                                                    <xsl:when test="@type='DropDownList'">
                                                                                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                                                     
                                                                                                                                    <xsl:value-of select="@value"/>
                                                                                                                                </xsl:if>
                                                                                                                            </xsl:for-each>
                                                                                                                        </xsl:if>
                                                                                                                    </xsl:when>
                                                                                                                </xsl:choose>
                                                                                                            </xsl:for-each>
                                                                                                        </div>
                                                                                                    </xsl:if>
                                                                                                </xsl:if>
                                                                                            </xsl:when>
                                                                                                
                                                                                            <xsl:when test="@type='CheckBoxList'">
                                                                                                <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                                            <xsl:value-of select="concat(' ' , @value)"/>
                                                                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                                        </xsl:if>
                                                                                                    </xsl:for-each>
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
                                                        </div>
                                                    </xsl:when>
                                                        
                                                    <xsl:when test="@type='RadioButtonList'">
                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                            <div class="form-group {@header2Class}">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                </label> 
                                                                <div class="col-sm-9">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                            <xsl:value-of select="current()"/>
                                                                        </xsl:if>
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
                                                                                        <span>
                                                                                            <xsl:value-of select="@label"/> 
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                    <span id="sub_textbox">
                                                                                                        <xsl:value-of select="@value"/>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
                                                                                        </span>
                                                                                    </xsl:when>
                                                                                    
                                                                                    <xsl:when test="@type='TextBox'">
                                                                                        <span>
                                                                                            <xsl:value-of select="@label"/> 
                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                <xsl:if test="@name='value'">
                                                                                                    <span id="sub_textbox">
                                                                                                        <xsl:value-of select="current()"/>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
                                                                                        </span>
                                                                                    </xsl:when>
                                                                                    
                                                                                    <xsl:when test="@type='RadioButtonList'">
                                                                                        <span>
                                                                                            <xsl:value-of select="@label"/>
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                    <span id="sub_textbox">
                                                                                                        <xsl:value-of select="current()"/>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
                                                                                        </span>
                                                                                    </xsl:when>
                                                                                    
                                                                                    <xsl:when test="@type='CheckBoxList'">
                                                                                        <xsl:value-of select="@label"/>
                                                                                        <span>
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                    <span id="sub_textbox">
                                                                                                        <xsl:value-of select="concat(' ' , @value)"/>
                                                                                                        <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                                    </span>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
                                                                                        </span>
                                                                                    </xsl:when>
                                                                                </xsl:choose>
                                                                            </xsl:for-each>
                                                                        </div>
                                                                    </xsl:if>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                    
                                                    <xsl:when test="@type='TextBoxDDL'">
                                                        <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                            <div class="form-group {@header2Class}">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <xsl:value-of select="current()"/>
                                                                        </xsl:if>
                                                                        <xsl:value-of select="@Backtext"/>
                                                                    </xsl:for-each>
                                                                     
                                                                    <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                             
                                                                            <xsl:value-of select="@value"/>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                        
                                                    <xsl:when test="@type='TextBox'">
                                                        <xsl:if test="PROPERTIES/PROPERTY[@name = 'value' and string(.)]">
                                                            <div class="form-group {@header2Class}">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                        <xsl:if test="@name='value'">
                                                                            <xsl:value-of select="current()"/>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                    
                                                    <!-- Main Text Area-->
                                                    <xsl:when test="@type='TextArea'">
                                                        <xsl:if test="VALUE and VALUE!=''">
                                                            <div class="form-group {@header2Class}">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <xsl:call-template name="LFsToBRs">
                                                                        <xsl:with-param name="input" select="VALUE"/>
                                                                    </xsl:call-template>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                        
                                                    <xsl:when test="@type='textareaFull'">
                                                        <xsl:if test="VALUE and VALUE!=''">
                                                            <div class="form-group {@header2Class}">
                                                                <div class="col-sm-12">
                                                                    <label>
                                                                        <xsl:value-of select="@label"/>
                                                                    </label> 
                                                                    <div id="{@id}">
                                                                        <xsl:attribute name="class">
                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                <xsl:if test="@name='class'">
                                                                                    <xsl:value-of select="current()"/>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:attribute>
                                                                        <xsl:value-of select="VALUE"/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                        
                                                    <xsl:when test="@type='CheckBoxList'">
                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                            <div class="form-group {@header2Class}">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                    <xsl:if test="@required='true'">
                                                                        <span class="required"> *</span>
                                                                    </xsl:if>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM[@Selected = 'true']">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                            <xsl:value-of select="concat(' ' , @value)"/>
                                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                                        </xsl:if>
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
                                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                            <xsl:if test="@name='value'">
                                                                                                <xsl:value-of select="current()"/>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                    </xsl:when>
                                                                                
                                                                                    <xsl:when test="@type='RadioButtonList'">
                                                                                        <xsl:value-of select="@label"/>  
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                <xsl:value-of select="current()"/>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                    </xsl:when>
                                                                                </xsl:choose>
                                                                            </xsl:for-each>
                                                                        </div>
                                                                    </xsl:if>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
                                                    </xsl:when>
                                                        
                                                    <xsl:when test="@type='DropDownList'">
                                                        <xsl:if test="boolean(LISTITEMS/LISTITEM/@Selected = 'true')">
                                                            <div class="form-group {@header2Class}">
                                                                <label class="col-sm-3 control-label">
                                                                    <xsl:value-of select="@label"/>
                                                                </label>
                                                                <div class="col-sm-9">
                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                        <xsl:if test="@Selected = 'true'">
                                                                             
                                                                            <xsl:value-of select="@value"/>
                                                                        </xsl:if>
                                                                    </xsl:for-each>
                                                                    <xsl:value-of select="@Backtext"/>
                                                                </div>
                                                            </div>
                                                            <div class="line line-dashed b-b line-lg "/>
                                                        </xsl:if>
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
    </xsl:template>
    
    <xsl:template name="LFsToBRs">
        <xsl:param name="input" />
        <xsl:choose>
            <xsl:when test="contains($input, '&#10;')">
                <xsl:value-of select="substring-before($input, '&#10;')" />
                <br />
                <xsl:call-template name="LFsToBRs">
                    <xsl:with-param name="input" select="substring-after($input, '&#10;')" />
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$input" />
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
</xsl:stylesheet>

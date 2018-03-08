<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output method="html"/>
    <xsl:template match="/">
        <div class="panel panel-default">
            <xsl:for-each select="PANELHEADER">
                <div>
                    <xsl:for-each select="PROPERTIES/PROPERTY">
                        <xsl:attribute name="{@name}">
                            <xsl:value-of select="current()"></xsl:value-of>
                        </xsl:attribute>
                    </xsl:for-each>
                    
                </div>
            </xsl:for-each>
                
            <xsl:for-each select="PANELBODY">
                <div class="panel-body">
                    <xsl:for-each select="FIELD">
                        <xsl:choose>
                                    
                            <!-- Main Checkbox TO BE CONTINUE-->
                            <xsl:when test="@type='CheckBoxList'">
                                <div class="form-group">
                                    <label class="col-sm-3 control-label">
                                        <xsl:value-of select="@label" />
                                    </label>
                                    <div class="col-sm-9">
                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                            <xsl:if test="@Selected = 'true'">
                                                <xsl:value-of select="concat(' ' , @value)" />
                                                <xsl:if test="not(position() = last())">,</xsl:if>
                                            </xsl:if>
                                        </xsl:for-each>
                                        <xsl:if test="FIELD">
                                            <div>
                                                <xsl:attribute name="id">
                                                    <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                </xsl:attribute>
                                                <xsl:attribute name="class">
                                                    <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                </xsl:attribute>
                                                <xsl:for-each select="FIELD">
                                                    <xsl:choose>
                                                        <xsl:when test="@type='TextBox'">
                                                            <xsl:value-of select="@label" />
                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                <xsl:if test="@name='value'">
                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                </xsl:if>
                                                            </xsl:for-each>
                                                        </xsl:when>
                                                    </xsl:choose>
                                                </xsl:for-each>
                                            </div>
                                        </xsl:if>
                                    </div>
                                </div>
                                <div class="line line-dashed b-b line-lg "></div>
                            </xsl:when>
                                
                            <!-- Main Grid -->
                            <xsl:when test="@type='RadGrid'">
                                <div class="form-group">
                                    <div class="col-sm-12">
                                        <table>
                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                <xsl:attribute name="{@name}">
                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                </xsl:attribute>
                                            </xsl:for-each>
                                            <thead>
                                                <tr>
                                                    <xsl:for-each select="HEADER/TH">
                                                        <th>
                                                            <xsl:value-of select="current()" />
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
                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                            <xsl:if test="@name='value'">
                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                            </xsl:if>
                                                                        </xsl:for-each>
                                                                        <xsl:if test="FIELD">
                                                                            <xsl:for-each select="FIELD">
                                                                                <xsl:choose>
                                                                                    <xsl:when test="@type='DropDownList'">
                                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                            <xsl:if test="@Selected = 'true'">
                                                                                                        &#160;
                                                                                                <xsl:value-of select="@value"></xsl:value-of>
                                                                                            </xsl:if>
                                                                                        </xsl:for-each>
                                                                                    </xsl:when>
                                                                                </xsl:choose>
                                                                            </xsl:for-each>
                                                                        </xsl:if>
                                                                    </xsl:when>
                                                                        
                                                                    <!-- Main Text Box With DropDownList-->
                                                                    <xsl:when test="@type='TextBoxDDL'">
                                                                        <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                            <xsl:if test="@name='value'">
                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                            </xsl:if>
                                                                            <xsl:value-of select="@Backtext"></xsl:value-of>
                                                                        </xsl:for-each>
                                                                                    &#160;
                                                                        <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                            <xsl:if test="@Selected = 'true'">
                                                                                            &#160;
                                                                                <xsl:value-of select="@value"></xsl:value-of>
                                                                            </xsl:if>
                                                                        </xsl:for-each>
                                                                    </xsl:when>
                                                                    
                                                                    <xsl:when test="@type='DropDownList'">
                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                            <xsl:if test="@Selected = 'true'">
                                                                                        &#160;
                                                                                <xsl:value-of select="@value"></xsl:value-of>
                                                                            </xsl:if>
                                                                        </xsl:for-each>
                                                                    </xsl:when>
                                                                    
                                                                    <xsl:when test="@type='RadioButtonList'">
                                                                                &#160;
                                                                        <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                            <xsl:if test="@Selected = 'true'">
                                                                                <xsl:value-of select="current()"></xsl:value-of>
                                                                            </xsl:if>
                                                                        </xsl:for-each>
                                                                        <xsl:if test="FIELD">
                                                                            <div>
                                                                                <xsl:attribute name="id">
                                                                                    <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                </xsl:attribute>
                                                                                <xsl:attribute name="class">
                                                                                    <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                </xsl:attribute>
                                                                                <xsl:for-each select="FIELD">
                                                                                    <xsl:choose>
                                                                                        <xsl:when test="@type='TextBox'">
                                                                                            <xsl:value-of select="@label" />&#160;
                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                <xsl:if test="@name='value'">
                                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
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
                                </div>
                            </xsl:when>
                                    
                            <!-- Main Panel Bar -->
                            <xsl:when test="@type='PanelBar'">
                                <div class="panel panel-default">
                                    <div class="panel-heading">
                                        <h4 class="panel-title">
                                            <!--<a class="accordion-toggle" data-toggle="collapse" data-target="#{@target_div}" href="javascript:void(0)">-->
                                            <a class="accordion-toggle" href="javascript:void(0)">
                                                <span>
                                                    <xsl:value-of select="@label"></xsl:value-of>
                                                </span>
                                            </a>
                                        </h4>
                                    </div>
                                    <div id="{@target_div}" class="panel-body">
                                        <xsl:for-each select="FIELD">
                                            <xsl:choose>
                                                <xsl:when test="@type='Header2'">
                                                    <h4>
                                                        <b> 
                                                            <xsl:value-of select="@label" /> 
                                                        </b>
                                                    </h4>
                                                </xsl:when>
                                                        
                                                <xsl:when test="@type='RadGrid'">
                                                    <div class="form-group">
                                                        <div class="col-sm-12">
                                                            <table>
                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                    <xsl:attribute name="{@name}">
                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                </xsl:for-each>
                                                                <thead>
                                                                    <tr>
                                                                        <xsl:for-each select="HEADER/TH">
                                                                            <th>
                                                                                <xsl:value-of select="current()" />
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
                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                <xsl:if test="@name='value'">
                                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
                                                                                            <xsl:if test="FIELD">
                                                                                                <xsl:for-each select="FIELD">
                                                                                                    <xsl:choose>
                                                                                                        <xsl:when test="@type='DropDownList'">
                                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                                            &#160;
                                                                                                                    <xsl:value-of select="@value"></xsl:value-of>
                                                                                                                </xsl:if>
                                                                                                            </xsl:for-each>
                                                                                                        </xsl:when>
                                                                                                    </xsl:choose>
                                                                                                </xsl:for-each>
                                                                                            </xsl:if>
                                                                                        </xsl:when>
                                                                                            
                                                                                        <!-- Main Text Box With DropDownList-->
                                                                                        <xsl:when test="@type='TextBoxDDL'">
                                                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                <xsl:if test="@name='value'">
                                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                                </xsl:if>
                                                                                                <xsl:value-of select="@Backtext"></xsl:value-of>
                                                                                            </xsl:for-each>
                                                                                    &#160;
                                                                                            <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                            &#160;
                                                                                                    <xsl:value-of select="@value"></xsl:value-of>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
                                                                                        </xsl:when>
                                                                    
                                                                                        <xsl:when test="@type='DropDownList'">
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                            &#160;
                                                                                                    <xsl:value-of select="@value"></xsl:value-of>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
                                                                                        </xsl:when>
                                                                    
                                                                                        <xsl:when test="@type='RadioButtonList'">
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                                                </xsl:if>
                                                                                            </xsl:for-each>
                                                                                            <xsl:if test="FIELD">
                                                                                                <div>
                                                                                                    <xsl:attribute name="id">
                                                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:attribute name="class">
                                                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                                                    </xsl:attribute>
                                                                                                    <xsl:for-each select="FIELD">
                                                                                                        <xsl:choose>
                                                                                                            <xsl:when test="@type='TextBox'">
                                                                                                                <xsl:value-of select="@label" />&#160;
                                                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                                                    <xsl:if test="@name='value'">
                                                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                                                    </xsl:if>
                                                                                                                </xsl:for-each>
                                                                                                            </xsl:when>
                                                                                                        </xsl:choose>
                                                                                                    </xsl:for-each>
                                                                                                </div>
                                                                                            </xsl:if>
                                                                                        </xsl:when>
                                                                                                
                                                                                        <xsl:when test="@type='CheckBoxList'">
                                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                                <xsl:if test="@Selected = 'true'">
                                                                                                    <xsl:value-of select="concat(' ' , @value)" />
                                                                                                    <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                                </xsl:if>
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
                                                    </div>
                                                </xsl:when>
                                                        
                                                <xsl:when test="@type='RadioButtonList'">
                                                    <div class="form-group">
                                                        <label class="col-sm-3 control-label">
                                                            <xsl:value-of select="@label" />
                                                        </label>&#160;
                                                        <div class="col-sm-9">
                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                <xsl:if test="@Selected = 'true'">
                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                </xsl:if>
                                                            </xsl:for-each>
                                                            <xsl:if test="FIELD">
                                                                <div>
                                                                    <xsl:attribute name="id">
                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                    <xsl:attribute name="class">
                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                    <xsl:for-each select="FIELD">
                                                                        <xsl:choose>
                                                                            <xsl:when test="@type='DropDownList'">
                                                                                <div>
                                                                                    <xsl:value-of select="@label" />&#160;
                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                            <xsl:value-of select="@value"></xsl:value-of>
                                                                                        </xsl:if>
                                                                                    </xsl:for-each>
                                                                                </div>
                                                                            </xsl:when>
                                                                                    
                                                                            <xsl:when test="@type='TextBox'">
                                                                                <div>
                                                                                    <xsl:value-of select="@label" />&#160;
                                                                                    <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                        <xsl:if test="@name='value'">
                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                        </xsl:if>
                                                                                    </xsl:for-each>
                                                                                </div>
                                                                            </xsl:when>
                                                                                    
                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                <div>
                                                                                    <xsl:value-of select="@label" />
                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                            <xsl:value-of select="current()"></xsl:value-of>
                                                                                        </xsl:if>
                                                                                    </xsl:for-each>
                                                                                </div>
                                                                            </xsl:when>
                                                                                    
                                                                            <xsl:when test="@type='CheckBoxList'">
                                                                                <xsl:value-of select="@label" />
                                                                                <div>
                                                                                    <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                        <xsl:if test="@Selected = 'true'">
                                                                                            <xsl:value-of select="concat(' ' , @value)" />
                                                                                            <xsl:if test="not(position() = last())">,</xsl:if>
                                                                                        </xsl:if>
                                                                                    </xsl:for-each>
                                                                                </div>
                                                                            </xsl:when>
                                                                        </xsl:choose>
                                                                    </xsl:for-each>
                                                                </div>
                                                            </xsl:if>
                                                        </div>
                                                    </div>
                                                    <div class="line line-dashed b-b line-lg "></div>
                                                </xsl:when>
                                                    
                                                <xsl:when test="@type='TextBoxDDL'">
                                                    <div class="form-group">
                                                        <label class="col-sm-3 control-label">
                                                            <xsl:value-of select="@label" />
                                                        </label>
                                                        <div class="col-sm-9">
                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                <xsl:if test="@name='value'">
                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                </xsl:if>
                                                                <xsl:value-of select="@Backtext"></xsl:value-of>
                                                            </xsl:for-each>
                                             &#160;
                                                            <xsl:for-each select="FIELD/LISTITEMS/LISTITEM">
                                                                <xsl:if test="@Selected = 'true'">
                                                                        &#160;
                                                                    <xsl:value-of select="@value"></xsl:value-of>
                                                                </xsl:if>
                                                            </xsl:for-each>
                                                        </div>
                                                    </div>
                                                    <div class="line line-dashed b-b line-lg "></div>
                                                </xsl:when>
                                                        
                                                <xsl:when test="@type='TextBox'">
                                                    <div class="form-group">
                                                        <label class="col-sm-3 control-label">
                                                            <xsl:value-of select="@label" />
                                                        </label>
                                                        <div class="col-sm-9">
                                                            <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                <xsl:if test="@name='value'">
                                                                    <xsl:value-of select="current()"></xsl:value-of>
                                                                </xsl:if>
                                                            </xsl:for-each>
                                                            <xsl:if test="FIELD">
                                                                <xsl:for-each select="FIELD">
                                                                    <xsl:choose>
                                                                        <xsl:when test="@type='DropDownList'">
                                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                <xsl:if test="@Selected = 'true'">
                                                                                            &#160;
                                                                                    <xsl:value-of select="@value"></xsl:value-of>
                                                                                </xsl:if>
                                                                            </xsl:for-each>
                                                                        </xsl:when>
                                                                    </xsl:choose>
                                                                </xsl:for-each>
                                                            </xsl:if>
                                                        </div>
                                                    </div>
                                                    <div class="line line-dashed b-b line-lg "></div>
                                                </xsl:when>
                                                        
                                                <xsl:when test="@type='textareaFull'">
                                                    <div class="form-group">
                                                        <div class="col-sm-12">
                                                            <label>
                                                                <xsl:value-of select="@label" />
                                                            </label>&#160;
                                                            <xsl:value-of select="VALUE"></xsl:value-of>
                                                        </div>
                                                    </div>
                                                    <div class="line line-dashed b-b line-lg "></div>
                                                </xsl:when>
                                                        
                                                <xsl:when test="@type='CheckBoxList'">
                                                    <div class="form-group">
                                                        <label class="col-sm-3 control-label">
                                                            <xsl:value-of select="@label" />
                                                            <xsl:if test="@required='true'">
                                                                <span class="required"> *</span>
                                                            </xsl:if>
                                                        </label>
                                                        <div class="col-sm-9">
                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                <xsl:if test="@Selected = 'true'">
                                                                    <xsl:value-of select="concat(' ' , @value)" />
                                                                    <xsl:if test="not(position() = last())">,</xsl:if>
                                                                </xsl:if>
                                                            </xsl:for-each>
                                                            <xsl:if test="FIELD">
                                                                <div>
                                                                    <xsl:attribute name="id">
                                                                        <xsl:value-of select="@Backdivid"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                    <xsl:attribute name="class">
                                                                        <xsl:value-of select="@Backcontrols"></xsl:value-of>
                                                                    </xsl:attribute>
                                                                    <xsl:for-each select="FIELD">
                                                                        <xsl:choose>
                                                                            <xsl:when test="@type='TextBox'">
                                                                                <xsl:value-of select="@label" />&#160;
                                                                                <xsl:for-each select="PROPERTIES/PROPERTY">
                                                                                    <xsl:if test="@name='value'">
                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:when>
                                                                                
                                                                            <xsl:when test="@type='RadioButtonList'">
                                                                                <xsl:value-of select="@label" />&#160;&#160;
                                                                                <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                                    <xsl:if test="@Selected = 'true'">
                                                                                        <xsl:value-of select="current()"></xsl:value-of>
                                                                                    </xsl:if>
                                                                                </xsl:for-each>
                                                                            </xsl:when>
                                                                        </xsl:choose>
                                                                    </xsl:for-each>
                                                                </div>
                                                            </xsl:if>
                                                        </div>
                                                    </div>
                                                    <div class="line line-dashed b-b line-lg "></div>
                                                </xsl:when>
                                                        
                                                <xsl:when test="@type='DropDownList'">
                                                    <div class="form-group">
                                                        <label class="col-sm-3 control-label">
                                                            <xsl:value-of select="@label" />
                                                        </label>
                                                        <div class="col-sm-9">
                                                            <xsl:for-each select="LISTITEMS/LISTITEM">
                                                                <xsl:if test="@Selected = 'true'">
                                                                            &#160;
                                                                    <xsl:value-of select="@value"></xsl:value-of>
                                                                </xsl:if>
                                                            </xsl:for-each>
                                                            <xsl:value-of select="@Backtext"></xsl:value-of>
                                                        </div>
                                                    </div>
                                                    <div class="line line-dashed b-b line-lg "></div>
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
    </xsl:template>
</xsl:stylesheet>